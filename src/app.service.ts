import { Injectable, Logger } from '@nestjs/common';
import { LoginService } from './login.service';
import { ProductService } from './product.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(
    private readonly loginService: LoginService,
    private readonly productService: ProductService,
  ) {}

  /**
   *
   * 主流程
   * @memberof AppService
   */
  async main() {
    await this.loginService.init();
    await this.productService.getProduct();
    const path = await this.productService.getSeckillUrl();
    console.log(path, 'path');
    const newpath = this.productService.resolvePath(path);
    this.logger.log(`抢购链接为${newpath}`);

    //有可能进行跳转 原Python这里是发生302直接重复执行，也可以放开redirect看下到底返回了啥
    const gotokill = () => {
      return new Promise(resolve => {
        const fn = () => {
          this.productService
            .goToKillUrl(newpath)
            .then(res => {
              console.log(res.data, 'newpath数据');
              this.loginService.cookieStore(res.headers);
              resolve('');
            })
            .catch(e => {
              console.log(e);
              this.logger.error('发生跳转，1秒后重试');
              setTimeout(() => {
                fn();
              }, 1000);
            });
        };
        fn();
      });
    };
    await gotokill();
    const checkout = () => {
      return new Promise(resolve => {
        const fn = () =>
          this.productService
            .toCheckOut()
            .then(checkRes => {
              console.log(checkRes.data, 'checkres结果');
              this.loginService.cookieStore(checkRes.headers);
              resolve('');
            })
            .catch(e => {
              console.log(e);
              this.logger.error('发生跳转，1秒后重试');
              setTimeout(() => {
                fn();
              }, 1000);
            });
        fn();
      });
    };
    await checkout();
    const info = await this.productService.killInfo();
    console.log(info.data, 'info信息');
    const jsondata = JSON.parse(info.data);
    this.loginService.cookieStore(info.headers);
    const final = await this.productService.submitOrder(jsondata);
    console.log(final.data, '抢购结果');
    const result = JSON.parse(final.data);
    if (result.success) {
      this.logger.log(`抢购成功，电脑付款链接:https:${result.pcUrl}`);
    }
    return;
  }
}
