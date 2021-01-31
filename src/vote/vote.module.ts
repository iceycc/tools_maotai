import { Module } from '@nestjs/common';
import { VoteController } from './vote.controller';
import { VoteService } from './vote.service';
import { TaskService } from './task.service';

@Module({
  controllers: [VoteController],
  providers: [VoteService, TaskService]
})
export class VoteModule {}
