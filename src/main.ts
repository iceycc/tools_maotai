import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
const port = process.env.PORT;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  Logger.log(`start in ${port}`);
  await app.listen(port,()=>{
    Logger.log(`start in http://0.0.0.0:${port}`);
  });
}
bootstrap();
