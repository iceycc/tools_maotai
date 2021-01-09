import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './task.service';
import { LoginService } from './login.service';
import { ProductService } from './product.service';
import { GupiaoSevice } from './gupiao.service';
import { ExportExcelService } from './export-excel.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, TasksService, LoginService, ProductService, GupiaoSevice, ExportExcelService],
})
export class AppModule {
}
