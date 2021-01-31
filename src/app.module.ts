import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { ExportExcelService } from './excel/export-excel.service';
import { RushInJd } from './rushInJd/rushInjd.module';// 京东抢购模块
import { StockModule } from './stock/stock.module'; // 获取股票信息模块
import { VoteModule } from './vote/vote.module';

@Module({
  imports: [ScheduleModule.forRoot(),
    // RushInJd,
    VoteModule,
    // StockModule,
  ],
  controllers: [
    AppController
  ],
  providers: [
    ExportExcelService
  ],
})
export class AppModule {
}
