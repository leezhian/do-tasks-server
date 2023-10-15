/*
 * @Author: kim
 * @Date: 2023-10-15 00:36:10
 * @Description: 任务消息
 */
import { Controller, Get, Param } from '@nestjs/common';
import { TaskLogService } from './task-log.service';
import { UserAuthInfo } from '../auth/auth.decorator'

@Controller('notice')
export class TaskLogController {
  constructor(private readonly taskTogService: TaskLogService) {}

  @Get(':team_id')
  findTaskDetail(@UserAuthInfo('uid') uid: string, @Param('team_id') TeamId: string) {
    return this.taskTogService.getNoticesByTeamId(uid, TeamId);
  }
}
