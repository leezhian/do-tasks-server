import { Module } from '@nestjs/common';
import { TaskLogService } from './task-log.service';
import { TaskLogController } from './task-log.controller';
import { TeamModule } from '../team/team.module'

@Module({
  controllers: [TaskLogController],
  providers: [TaskLogService],
  imports: [TeamModule]
})
export class TaskLogModule { }
