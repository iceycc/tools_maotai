import { Module } from '@nestjs/common';
import { RushInJdController } from './rushInJd.controller';
import { RushInJdService } from './rushInJd.service';
import { TasksService } from './task.service';
import { LoginService } from './login.service';
import { ProductService } from './product.service';
import { ExportExcelService } from '../excel/export-excel.service';

@Module({
  imports: [],
  controllers: [RushInJdController],
  providers: [RushInJdService, TasksService, LoginService, ProductService, ExportExcelService],
})
export class RushInJd {
}
