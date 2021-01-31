import { Controller, Get, Header } from '@nestjs/common';
import { VoteService } from './vote.service';
import * as path from 'path';

const voteCodePath = path.resolve(__dirname, '../../', 'temp');

@Controller('tesseract')
export class VoteController {
  constructor(private readonly service: VoteService) {
  }

  @Get()
  async getPicCodeText() {
    // 获取验证码
    const rnd = '050429386853' + Math.floor((Math.random() * 10000));
    const itemid = 4670242;
    const extname = '.png';
    const pngName = 'votecode';
    const filepath = `${voteCodePath}/${pngName}${extname}`;
    return await this.service.ocrCode({
      filepath, rnd, itemid,
    });
  }

  @Get('/checkCode')
  async checkcode() {
    return await this.service.checkCode({} as any);
  }

  @Get('/getCookie')
  async getCookie() {
    return await this.service.getCookie();
  }

  @Get('/vote')
  async vote() {
    return await this.service.vote({
      utime: '1612061084',
      itemid: '4670242',
      catid: '156157',
      rnd: '77062455774214',
      captcha: '2067',
    });
  }

}
