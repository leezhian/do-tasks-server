import { omit } from 'lodash';
import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { PrismaService } from '../prisma/prisma.service';
import { TeamService } from '../team/team.service'

@Injectable()
export class TaskLogService {
  constructor(private readonly prisma: PrismaService, private readonly teamService: TeamService) { }

  async getNoticesByTeamId(uid: string, teamId: string) {
    await this.teamService.checkTeamPermissionByTeamId(uid, teamId)

    const logs = await this.prisma.taskLog.findMany({
      where: {
        team_id: teamId,
        receiver_id: uid
      },
      select: {
        id: true,
        type: true,
        status: true,
        editor: {
          select: {
            name: true
          }
        },
        project: {
          select: {
            project_id: true,
            name: true
          }
        },
        task: {
          select: {
            task_id: true,
            title: true
          }
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return logs.map(item => {
      return {
        ...omit(item, ['editor', 'createdAt']),
        editor: item.editor.name,
        create_time: dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      }
    })
  }
}
