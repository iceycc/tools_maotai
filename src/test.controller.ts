import { Controller, Get, Response } from '@nestjs/common';

import { Response as Res } from "express";
import { ExportExcelService } from './export-excel.service';

@Controller('')
export class FileController {
  constructor (
    private readonly exportExcelService: ExportExcelService,
  ) { }

  @Get('/excel')
  exportExcel(
    @Response() res: Res,
  ) {
    const titleList = [
      { label: 'ID', value: 'id' },
      { label: '姓名', value: 'name' },
      { label: '地址', value: 'address' }
    ];
    const dataList = [
      {
        id: 1,
        name: '张三',
        address: '深圳',
      }
    ];
    const result = this.exportExcelService.exportExcel(titleList, dataList);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats;charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent("文件") + '.xlsx'); // 中文名需要进行url转码
    res.setTimeout(30 * 60 * 1000); // 防止网络原因造成超时。
    res.end(result, 'binary');
  }
}
