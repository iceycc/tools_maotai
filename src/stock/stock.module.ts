import { Module } from '@nestjs/common';
import { GupiaoSevice } from './gupiao.service';
import { ExportExcelService } from '../excel/export-excel.service';

@Module({
  controllers: [],
  providers: [GupiaoSevice, ExportExcelService],
})
export class StockModule {
}
