import { Injectable, Logger } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { VoteService } from './vote.service';
import * as path from 'path';
import * as moment from 'moment';

const voteCodePath = path.resolve(__dirname, '../../', 'temp');

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  private timer = null;

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private readonly voteService: VoteService,
  ) {
    this.initVote();
  }

  @Cron('* */30 * * * *')
  job() {
    this.logger.debug(`${moment().format('YYYY年MM月DD日  HH时mm分ss秒')}`);
    this.initVote().then(r => console.log(r));
  }


  async initVote() {
    this.logger.log('准备投票');
    // 获取验证码
    const rnd = '0504293863331' + Math.floor((Math.random() * 10000));
    const itemid = 4670242;
    const extname = '.png';
    const pngName = 'votecode';
    const filepath = `${voteCodePath}/${pngName}${extname}`;
    const codeRes = await this.voteService.ocrCode({
      filepath, rnd, itemid,
    });
    // 验证
    if (codeRes && codeRes.code) {
      this.logger.warn('识别的验证码: ' + codeRes.code);
      const checkRes = await this.voteService.checkCode({
        rnd, itemid, captcha: codeRes.code,
      });
      this.logger.warn('校验的验证码:checkRes ' + checkRes);
      const { time, status } = JSON.parse(checkRes) || {};
      if (+status === 1) {
        const res = await this.voteService.vote({
          utime: time + '',
          itemid: itemid + '',
          catid: '156157',
          rnd: rnd + '',
          captcha: codeRes.code,
        });
        this.logger.warn('vote ' + res);
        if (+res.status === 1) {
          clearTimeout(this.timer);
          this.timer = null;
          this.timer = setTimeout(async () => {
            await this.initVote();
          }, 30 * 60 * 1000);
        }
      } else {
        await this.initVote();
      }

    } else {
      await this.initVote();
    }
    // 投票
  }
}
