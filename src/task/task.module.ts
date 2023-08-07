import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { ProjectModule } from '../project/project.module'
import { TeamModule } from 'src/team/team.module';

@Module({
  controllers: [TaskController],
  providers: [TaskService],
  imports: [ProjectModule, TeamModule]
})
export class TaskModule { }
