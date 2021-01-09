import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import 'dotenv/config';
import { defaultUa } from '../ua';
import * as fs from 'fs';
import { randomRange } from '../utils';
import * as shell from 'shelljs';
import * as path from 'path';
// import * as qrcode from 'qrcode-terminal';

const cookiePath = path.resolve(__dirname, '../', 'maotai.cookie');
const qrcodePath = path.resolve(__dirname, '../', 'qrcode.png');
console.log(__dirname);
console.log(qrcodePath);

interface CookieData {
  cookie: string[];
  ua: string;
}

@Injectable()
export class LoginService {
  private readonly logger = new Logger(LoginService.name);
  cookies: string[];
  islogin: boolean;
  ua: string = defaultUa;

  /**
   *
   * cookie判断
   * @return {*}
   * @memberof LoginService
   */
  async init() {
    const isExist = fs.existsSync(cookiePath);
    if (isExist) {
      const data = this.getCookieFromLocal();
      this.cookies = data.cookie;
    } else {
      this.logger.log('未找到cookie文件');
    }
    const sign = await this.validate();
    if (!sign) {
      // 验证失败不是过期就是未登录。都需要清理cookie
      this.cookies = [];
      const fn = async () => {
        return new Promise(async resolve => {
          const s = await this.main();
          if (!s) {
            setTimeout(() => {
              fn();
            }, 2000);
          } else {
            resolve('');
          }
        });
      };
      await fn();
    }
    this.logger.log('已在登录状态');
    return;
  }

  /**
   *
   * 存储到本地
   * @return {*}
   * @memberof LoginService
   */
  storeCookieTolocal() {
    const writeData: CookieData = {
      cookie: this.cookies,
      ua: this.ua,
    };
    fs.writeFileSync(cookiePath, JSON.stringify(writeData));
    return;
  }

  /**
   *
   * 从本地获取cookie
   * @return {*}
   * @memberof LoginService
   */
  getCookieFromLocal() {
    const cookie = fs.readFileSync(cookiePath).toString();
    const data: CookieData = JSON.parse(cookie);
    return data;
  }

  /**
   *
   *  处理cookie
   * @param {string[]} cookie
   * @returns
   * @memberof LoginService
   */
  cookieResolve(cookie: string[]) {
    if (Array.isArray(cookie)) {
      return cookie.reduce((prev, next) => {
        const ls = next.split(';');
        prev.push(ls[0]);
        return prev;
      }, []);
    } else {
      return [];
    }
  }

  /**
   *
   * 处理请求头的cookie
   * @param {*} headers
   * @memberof LoginService
   */
  cookieStore(headers) {
    const cookie = headers['set-cookie'];
    const rescookie = this.cookieResolve(cookie);
    Array.isArray(this.cookies)
      ? (this.cookies = this.cookies.concat(rescookie))
      : (this.cookies = rescookie);
  }

  /**
   *
   * 将cookie给到请求头
   * @return {*}
   * @memberof LoginService
   */
  cookieToHeader() {
    if (this.cookies && this.cookies.length > 0) {
      return this.cookies.join('; ');
    }
    return '';
  }

  /**
   *
   * 返回请求头
   * @returns
   * @memberof LoginService
   */
  getHeaders() {
    return {
      'User-Agent': this.ua,
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      Connection: 'keep-alive',
    };
  }

  /**
   *
   * 主登录流程
   * @memberof LoginService
   */
  async main() {
    this.logger.log('进行登录流程');
    const res = await axios.get('https://passport.jd.com/new/login.aspx', {
      headers: this.getHeaders(),
    });
    this.cookieStore(res.headers);
    const sign = await this.getQrcode();
    if (!sign) {
      this.logger.log('未获取到登录二维码');
      return false;
    }
    this.logger.log(`二维码文件位于${qrcodePath}`);
    this.openQrcode();
    const ticket = await this.qrcodeScan();
    const result = await this.validateTicket(ticket);
    if (!result) {
      this.logger.log('登录票据有误');
      return false;
    }
    return await this.validate();
  }

  async openQrcode() {
    shell.exec(`open ${qrcodePath}`);
    // qrcode.generate(`open ${qrcodePath}`, {
    //   small: true,
    // });
    return;
  }

  /**
   *
   * 获取qrcode
   * @returns
   * @memberof LoginService
   */
  async getQrcode() {
    const url = 'https://qr.m.jd.com/show';
    const cookie = this.cookieToHeader();
    return new Promise<boolean>(resolve => {
      axios
        .get(url, {
          headers: {
            'User-Agent': this.ua,
            Referer: 'https://passport.jd.com/new/login.aspx',
            cookie,
          },
          responseType: 'arraybuffer',
          params: {
            appid: 133,
            size: 147,
            t: Date.now(),
          },
        })
        .then(res => {
          if (res.status === 200) {
            this.cookieStore(res.headers);
            // qrcode.generate(res.data, {
            //   small: true,
            // });
            fs.writeFile(qrcodePath, res.data, err => {
              if (err) throw err;
              // qrcode.generate(res.data, {
              //   small: true,
              // })
              resolve(true);
            });
          }
        })
        .catch(e => {
          this.logger.log(e);
          resolve(false);
        });
    });
  }

  /**
   *
   *  用户扫描等待逻辑
   * @memberof LoginService
   */
  async qrcodeScan() {
    const reg = /(?<=wlfstk_smdl=)(.*)/;
    let stk: string;
    this.cookies.some(v => {
      const res = reg.exec(v);
      if (res) {
        stk = res[0];
        return true;
      }
      return false;
    });
    const randomInt = randomRange(1000000, 9999999);
    const params = {
      callback: `jQuery${randomInt}`,
      appid: '133',
      token: stk,
      _: Date.now(),
    };
    const headers = {
      'User-Agent': this.ua,
      Referer: 'https://passport.jd.com/new/login.aspx',
      cookie: this.cookieToHeader(),
    };
    const msgReg = /(?<="msg" : ")(.+)(?=")/;
    const codeReg = /(?<="code" : )(.+)(?=,)/;
    const ticketReg = /(?<="ticket" : ")(.+)(?=")/;
    return new Promise<string>(resolve => {
      const fn = () => {
        axios
          .get('https://qr.m.jd.com/check', {
            headers,
            params,
          })
          .then(res => {
            const code = codeReg.exec(res.data)[0];
            // 201 未扫描 203过期 202确认登录中 200给你个ticket
            if (code !== '200') {
              const msg = msgReg.exec(res.data)[0];
              this.logger.log(msg);
              if (code !== '203') {
                setTimeout(() => {
                  fn();
                }, 2000);
              } else {
                resolve('');
              }
            } else {
              const ticket = ticketReg.exec(res.data)[0];
              resolve(ticket);
            }
          })
          .catch(e => {
            console.log(e);
            this.logger.log('京东更新了登录逻辑，请联系作者yehuozhili');
          });
      };
      fn();
    });
  }

  /**
   *
   * 验证ticket
   * @param {string} ticket
   * @returns
   * @memberof LoginService
   */
  async validateTicket(ticket: string) {
    const url = 'https://passport.jd.com/uc/qrCodeTicketValidation';
    const headers = {
      'User-Agent': this.ua,
      Referer: 'https://passport.jd.com/uc/login?ltype=logout',
      cookie: this.cookieToHeader(),
    };
    const res = await axios.get(url, {
      headers,
      params: {
        t: ticket,
      },
    });
    if (res.data.returnCode === 0) {
      this.cookieStore(res.headers);
      return true;
    }
    return false;
  }

  /**
   *
   * 验证是否能登录
   * @return {*}
   * @memberof LoginService
   */
  async validate() {
    const url = 'https://order.jd.com/center/list.action';
    try {
      await axios.get(url, {
        headers: {
          'User-Agent': this.ua,
          cookie: this.cookieToHeader(),
        },
        params: {
          rid: Date.now(),
        },
        maxRedirects: 0,
      });
      this.storeCookieTolocal();
      this.logger.log('验证成功');
      this.islogin = true;
      return true;
    } catch {
      this.logger.log('验证失败');
      this.islogin = false;
      return false;
    }
  }
}
