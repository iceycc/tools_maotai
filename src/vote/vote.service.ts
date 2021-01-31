import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as request from 'request';
import * as Tesseract from 'tesseract.js';

const voteCodePath = path.resolve(__dirname, '../../', 'temp');

@Injectable()
export class VoteService {
  private readonly logger = new Logger(VoteService.name);
  private cookie = null;

  async getCookie() {
    request({
      url: 'http://m.changkeweb.cn/activity?sid=808032fc0a989f23&cfrom=UP2CW',
      method: 'GET',
      headers: {
        Accept: '*/*',
        'Accept-Encoding': 'utf-8',
        'Accept-Language': 'zh-CN,zh;q=0.8',
        Connection: 'keep-alive',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; LIO-AN00 Build/HUAWEILIO-AN00; wv) AppleWebKit/537.37 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045513 Mobile Safari/537.36 MMWEBID/4014 MicroMessenger/8.0.1840(0x28000037) Process/tools WeChat/arm64 Weixin NetType/WIFI Language/en ABI/arm64',//伪装浏览器
      },
    }, (err, response) => {
      console.log(response.headers['set-cookie']);

    });
  }

  async ocrCode({
                  filepath, rnd, itemid,
                }) {
    await this.getPicCode({ filepath, rnd, itemid });
    const { data: { text } } = await Tesseract.recognize(
      filepath,
      'eng',
      {
        logger: m => {
          console.log(m);
        },
      },
    );
    console.log('Tesseract识别的原始图形码', text);
    this.logger.warn('Tesseract识别的原始图形码: ' + text);
    const codes = getIntArr(text);
    if (codes.length > 0) {
      const code = codes.join();
      if (code.length !== 4) {
        return false;
      }
      return {
        code,
        rnd,
      };
    } else {
      return false;
    }
  }

  async vote({
               utime,
               itemid,
               catid,
               rnd,
               captcha,
             }) {
    // http://vote.changkeweb.cn/api/vote/vote.php
    return new Promise<any>((resolve, reject) => {
      const params = {
        utime,
        itemid,
        catid,
        rnd,
        captcha,
      };
      request({
        url: `http://vote.changkeweb.cn/api/vote/vote.php`,
        headers: {
          // Cookie: this.cookie,
          'Cookie': [
            'UM_distinctid=177560a8aa499-084fe6b3915731-1414206e-4c900-177560a8aa5305',
            'czt_openinfo=%257B%2522uid%2522%253A%252275214616%2522%252C%2522token%2522%253A%2522147ba1cdad3260cdfb75827d80f783eb%2522%257D',
            // 'acw_tc=707c9f9616120719273108518e6181bd3a82e611c01140910fc8fd0ecab1c0',
          ].concat(this.cookie),
          Accept: '*/*',
          'Accept-Encoding': 'utf-8',
          'Accept-Language': 'zh-CN,zh;q=0.8',
          Connection: 'keep-alive',
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; LIO-AN00 Build/HUAWEILIO-AN00; wv) AppleWebKit/537.37 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045513 Mobile Safari/537.36 MMWEBID/4014 MicroMessenger/8.0.1840(0x28000037) Process/tools WeChat/arm64 Weixin NetType/WIFI Language/en ABI/arm64',//伪装浏览器
        },
        method: 'POST',
        form: params,
      }, (err, response, body) => {
        /*
            response 响应信息的集合
          */
        // response.cookie = this.cookie;
        if (!err && response.statusCode == 200) {
          resolve(body);
        } else {
          resolve(body);
        }
      });
    });

  }

  async getPicCode({ rnd, itemid, filepath }): Promise<any> {
    // const rnd = '050429386853' + Math.floor((Math.random() * 10000));
    // const itemid = 4670242;
    // const extname = '.png';
    // const pngName = 'votecode';
    // const filepath = `${voteCodePath}/${pngName}${extname}`;
    const url = `http://vote.changkeweb.cn/api/vote/captcha.png.php?rnd=${rnd}&itemid=${itemid}&authType=4`;
    // const res = await axios.get(url, {});
    // console.log(typeof res.data);
    const options = {
      url: url,
      headers: {
        Accept: '*/*',
        'Accept-Encoding': 'utf-8',
        'Accept-Language': 'zh-CN,zh;q=0.8',
        Connection: 'keep-alive',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',//伪装浏览器
      },
      method: 'GET',
    };
    const stream = fs.createWriteStream(filepath);
    return new Promise<any>((resolve, reject) => {
      request(options, (error, response) => {
        this.cookie = response.headers['set-cookie'] || [];
      }).pipe(stream).on('close', (err) => {
        if (err) reject(err);
        resolve(filepath);
      });
    });
    // fs.writeFileSync(filepath, res.data);
    // await this.writePicByBs64(res.data, rnd);
  }

  checkCode({ rnd, itemid, captcha }) {
    return new Promise<any>((resolve, reject) => {
      request({
        // url: 'http://api.changkeweb.cn/yuntou/mobile/wx_get_signature.php?url=http%3A%2F%2Fm.changkeweb.cn%2Factivity%3Fsid%3D808032fc0a989f23%26cfrom%3DUP2CW%23fc',
        url: `http://vote.changkeweb.cn/api/vote/captcha.check.php?rnd=${rnd}&itemid=${itemid}&authType=4&captcha=${captcha}`,
        headers: {
          Accept: '*/*',
          'Accept-Encoding': 'utf-8',
          'Accept-Language': 'zh-CN,zh;q=0.8',
          Connection: 'keep-alive',
          'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',//伪装浏览器
        },
        method: 'GET',
      }, (err, response, body) => {
        /*
            response 响应信息的集合
          */

        if (!err && response.statusCode == 200) {
          resolve(body);
        } else {
          resolve(body);
        }
      });
    });
  }

}

function getIntArr(str) {
  return str.replace(/[^0-9]/ig, ' ').trim().split(/\s+/);
}

async function writePicByBs64(imgData, layout_id) {
  //接收前台传递的参数   base64格式的图片数据,图片名称
  // const { imgData, layout_id } = ctx.request.body;


  //过滤data:URL
  const base64Data = imgData.replace(/^data:image\/\w+;base64,/, '');
  const dataBuffer = Buffer.from(base64Data, 'base64');

  const allowExtname = ['png', 'jpg', 'jpeg', 'webp', 'bmp'];//支持的图片格式

  //获取扩展名
  let extname = '';
  const filterResult = allowExtname.filter(item => {
    return imgData.includes(item);
  });
  extname = '.' + (filterResult[0] || 'png');
  // 写入图片
  const filepath = `${voteCodePath}/${layout_id}${extname}`;
  await fs.writeFileSync(filepath, dataBuffer);
}
