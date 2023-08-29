import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { TeamService } from '../team/team.service'
import { PrismaService } from '../prisma/prisma.service'
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto, UpdateProjectStatusDto } from './dto/update-project.dto';
import { SelectProjectListDto } from './dto/select-project-list.dto';
import { SelectTaskStatusSummaryDto } from './dto/select-task-summary.dto';
import { ProjectStatus, TaskStatus } from '../helper/enum'
import { TaskDoneAndApprovedSummary } from '../typings/project'

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService, private readonly teamService: TeamService) { }

  /**
   * @description: 判断项目是否存在并且有权限（会深入判断是否有队伍权限）
   * @param {string} uid
   * @param {string} projectId 项目id
   * @return {void}
   */
  async checkTeamPermissionByProjectId(uid: string, projectId: string) {
    const projectWithTeam = await this.prisma.project.findUnique({
      where: {
        project_id: projectId
      },
      select: {
        project_id: true,
        name: true,
        status: true,
        team: {
          select: {
            team_id: true,
            name: true,
            members: true,
            status: true,
            creator_id: true
          }
        }
      }
    })

    if (!projectWithTeam || projectWithTeam.status === ProjectStatus.Ban) {
      throw new NotFoundException('项目不存在')
    }

    if (projectWithTeam.team.creator_id !== uid && !this.teamService.isTeamMember(uid, projectWithTeam.team.members)) {
      throw new ForbiddenException('您没有权限访问该团队')
    }

    return projectWithTeam
  }

  /**
   * @description: 创建项目
   * @param {string} uid
   * @param {CreateProjectDto} createProjectDto
   * @return {*}
   */
  async createProject(uid: string, createProjectDto: CreateProjectDto) {
    const { team_id } = createProjectDto
    await this.teamService.checkTeamPermissionByTeamId(uid, team_id)

    const project = await this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        team_id: team_id
      },
      select: {
        project_id: true,
        name: true,
        status: true,
      }
    })

    return {
      ...project,
      _count: {
        total: 0,
        done_task_count: 0
      }
    }
  }

  /**
   * @description: 修改项目信息
   * @param {string} uid 用户id
   * @param {string} projectId 项目id
   * @param {UpdateProjectDto} updateProjectDto
   * @return {*}
   */
  async updateProject(uid: string, projectId: string, updateProjectDto: UpdateProjectDto) {
    const project = await this.checkTeamPermissionByProjectId(uid, projectId)
    if (project.status !== ProjectStatus.Active) {
      throw new BadRequestException('项目已归档')
    }

    await this.prisma.project.update({
      where: {
        project_id: projectId
      },
      data: {
        name: updateProjectDto.name
      }
    })

    return {
      code: 200,
      message: '更新成功'
    }
  }

  /**
   * @description: 修改项目状态
   * @param {string} uid 用户id
   * @param {string} projectId 项目id
   * @param {UpdateProjectStatusDto} updateProjectStatusDto
   * @return {*}
   */
  async updateProjectStatus(uid: string, projectId: string, updateProjectStatusDto: UpdateProjectStatusDto) {
    await this.checkTeamPermissionByProjectId(uid, projectId)

    await this.prisma.project.update({
      where: {
        project_id: projectId
      },
      data: {
        status: updateProjectStatusDto.status
      }
    })

    return {
      code: 200,
      message: '更新成功'
    }
  }

  /**
   * @description: 根据id获取项目详情
   * @param {string} uid
   * @param {string} projectId
   * @return {*}
   */
  async selectProjectById(uid: string, projectId: string) {
    const project = await this.checkTeamPermissionByProjectId(uid, projectId)
    const [taskCount, doneTaskCount] = await this.prisma.$transaction([
      this.prisma.task.count({
        where: {
          project_id: projectId,
          status: {
            not: TaskStatus.Ban
          }
        }
      }),
      this.prisma.task.count({
        where: {
          project_id: projectId,
          status: TaskStatus.Done
        }
      })
    ])

    return {
      ...project,
      task_summary: {
        total: taskCount,
        done_task_count: doneTaskCount
      }
    }
  }

  /**
   * @description: 获取项目列表
   * @param {string} uid
   * @param {SelectProjectListDto} query
   * @return {*}
   */
  async selectProjectsByIdAndStatus(uid: string, query: SelectProjectListDto) {
    const { team_id, status = ProjectStatus.Active } = query
    await this.teamService.checkTeamPermissionByTeamId(uid, team_id)

    // remark： 这里待优化，处理方式不太好
    const [projectList, projectsDoneTaskCount] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where: {
          team_id: team_id,
          status: status as number
        },
        select: {
          project_id: true,
          name: true,
          status: true,
          createdAt: true,
          _count: {
            select: {
              tasks: {
                where: {
                  status: {
                    not: TaskStatus.Ban
                  }
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.prisma.project.findMany({
        where: {
          team_id: team_id,
          status: status as number
        },
        select: {
          _count: {
            select: {
              tasks: {
                where: {
                  status: TaskStatus.Done
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ])

    if (projectList.length !== projectsDoneTaskCount.length) {
      throw new InternalServerErrorException('获取项目列表出现错误')
    }

    return projectList.map((project, index) => {
      return {
        ...project,
        _count: {
          total: project._count.tasks,
          done_task_count: projectsDoneTaskCount[index]._count.tasks
        }
      }
    })
  }

  /**
   * @description: 获取每日完成任务数量
   * @param {string} uid 用户id
   * @param {string} projectId 项目id
   * @return {*}
   */
  async getTaskStautsSummary(uid: string, projectId: string, query: SelectTaskStatusSummaryDto) {
    await this.checkTeamPermissionByProjectId(uid, projectId)
    const { object = 0 } = query

    // remark: count 查询后会返回BigInt，即{count: 1n}，导致无法正常序列化， https://github.com/prisma/prisma/discussions/14863 和 https://github.com/prisma/prisma/issues/14613
    const [selectDoneCount, selectApprovedCount]: [TaskDoneAndApprovedSummary[], TaskDoneAndApprovedSummary[]] = await this.prisma.$transaction([
      this.prisma.$queryRawUnsafe(`SELECT FROM_UNIXTIME(done_task_time, '%Y-%m-%d') AS day, COUNT(task_id) as count, 'done_task' as type from Task WHERE (done_task_time BETWEEN ${dayjs().subtract(6, 'day').startOf('date').unix()} AND ${dayjs().endOf('date').unix()}) ${object ? `AND (owner_ids LIKE '%${uid}%')` : ''} GROUP BY day`),
      this.prisma.$queryRawUnsafe(`SELECT FROM_UNIXTIME(review_time, '%Y-%m-%d') AS day, COUNT(task_id) as count , 'approved_task' as type from Task WHERE (review_time BETWEEN ${dayjs().subtract(6, 'day').startOf('date').unix()} AND ${dayjs().endOf('date').unix()}) ${object ? `AND (reviewer_id = '${uid}')` : ''} GROUP BY day`),
    ])

    const result: TaskDoneAndApprovedSummary[] = []
    for (let index = 6; index >= 0; index--) {
      const day = dayjs().subtract(index, 'day').format('YYYY-MM-DD')

      const doneTarget = selectDoneCount.find(item => item.day === day) || { day, type: 'done_task', count: 0 }
      const approvedTarget = selectApprovedCount.find(item => item.day === day) || { day, type: 'approved_task', count: 0 }

      result.push({
        ...doneTarget,
        count: Number(doneTarget.count)
      })
      result.push({
        ...approvedTarget,
        count: Number(approvedTarget.count)
      })
    }

    return result
  }

  /**
   * @description: 获取用户任务汇总
   * @param {string} uid
   * @param {string} projectId
   * @return {*}
   */  
  async getUserTaskStat(uid: string, projectId: string) {
    await this.checkTeamPermissionByProjectId(uid, projectId)

    const [doneCount, reviewedCount, needDoneCount, neewReviewCount] = await this.prisma.$transaction([
      this.prisma.task.count({
        where: {
          project_id: projectId,
          owner_ids: {
            contains: uid
          },
          OR: [
            {
              status: TaskStatus.UnderReview,
            },
            {
              status: TaskStatus.Done,
            }
          ]
        }
      }),
      this.prisma.task.count({
        where: {
          project_id: projectId,
          reviewer_id: uid,
          OR: [
            {
              status: TaskStatus.ReviewFailed,
            },
            {
              status: TaskStatus.Done,
            }
          ]
        }
      }),
      this.prisma.task.count({
        where: {
          project_id: projectId,
          owner_ids: {
            contains: uid
          }
        }
      }),
      this.prisma.task.count({
        where: {
          project_id: projectId,
          reviewer_id: uid,
        }
      }),
    ])
    
    return {
      done_count: doneCount,
      reviewed_count: reviewedCount,
      need_done_count: needDoneCount,
      need_review_count: neewReviewCount
    }
  }

  /**
   * @description: 删除项目
   * @param {string} projectId
   * @return {*}
   */
  async removeProject(uid: string, projectId: string) {
    await this.checkTeamPermissionByProjectId(uid, projectId)

    await this.prisma.project.update({
      where: {
        project_id: projectId
      },
      data: {
        status: ProjectStatus.Ban
      }
    })

    return {
      code: 200,
      message: '删除成功'
    }
  }
}
