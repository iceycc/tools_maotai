import { Controller, Get } from '@nestjs/common';
import { RushInJdService } from './rushInJd.service';

@Controller()
export class RushInJdController {
  constructor(private readonly appService: RushInJdService) {}

  @Get()
  getHello(): string {
    return 'hello';
  }
}
