import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { defaultUa } from './ua';
import * as cheerio from 'cheerio';
import { ExportExcelService } from './export-excel.service';
import * as fs from 'fs';
import * as Path from 'path';

const excelPath = Path.resolve(__dirname, '..', 'chaogu.xlsx');

@Injectable()
export class GupiaoSevice {
  private readonly logger = new Logger(GupiaoSevice.name);
  ua: string = defaultUa;

  constructor(private readonly excelService: ExportExcelService) {
    this.getHtml();
  }

  async getHtml() {
    this.logger.debug('股票开始');
    const url = 'http://quotes.money.163.com/f10/zycwzb_600519.html#01c01';
    const res = await axios.get(url, {
      headers: {
        'User-Agent': this.ua,
      },
    });
    this.logger.debug('股票结束');
    const $ = cheerio.load(res.data);
    const title = $('title').text();
    this.logger.log(`您设定的股票为：${title}`);
    const tablesKey = $('.limit_sale').first();
    const tables = $('.scr_table').find('tr');
    const keys = [''];
    const titleList: { label: string, value: any }[] = [];
    const dataList: any[] = [];
    tablesKey.find('td').each(function() {
      keys.push($(this).text());
    });
    tables.find('th').each(function(__) {
      const th = $(this).text();
      titleList.push({
        label: th,
        value: th,
      });
    });
    // console.log(JSON.stringify(titleList))
    tables.each(function(i) {
      const data = {};
      data['date'] = keys[i];
      $(this).find('td').each(function(i) {
        data[titleList[i].value] = $(this).text();
      });
      dataList.push(data);
    });
    titleList.unshift({
      label: '报告日期',
      value: 'date',
    });

    dataList.shift();
    const excel = await this.excelService.exportExcel(titleList, dataList);
    fs.writeFileSync(excelPath, excel);
  }
}
