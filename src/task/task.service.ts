import { omit } from 'lodash';
import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { SelectTaskDto } from './dto/select-task.dto';
import { TaskStatus, ProjectStatus, AccountStatus } from '../helper/enum'
import { filePathDomain } from '../helper/constants'
import { TeamService } from '../team/team.service'
import { ProjectService } from '../project/project.service'

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService, private readonly projectService: ProjectService, private readonly teamService: TeamService) { }

  /**
   * @description: 检查任务时间是否合理
   * @param {number} start 开始时间
   * @param {number} end 结束时间
   * @return {boolean}
   */
  checkTaskTimeIsReasonable(start: number, end: number) {
    return end >= start
  }

  /**
   * @description: 根据任务id判断是否有团队权限，有则返回任务信息，无则抛出异常
   * @param {string} uid
   * @param {string} taskId
   * @return {*}
   */
  async checkTeamPermissionByTaskId(uid: string, taskId: string) {
    const taskWithTeam = await this.prisma.task.findUnique({
      where: {
        task_id: taskId
      },
      include: {
        project: {
          include: {
            team: true
          }
        }
      }
    })

    if (!taskWithTeam) {
      throw new NotFoundException('任务不存在')
    }

    if (!taskWithTeam.project || taskWithTeam.project.status === ProjectStatus.Ban) {
      throw new NotFoundException('项目不存在')
    }


    if (taskWithTeam.project.team.creator_id !== uid && !this.teamService.isTeamMember(uid, taskWithTeam.project.team.members)) {
      throw new ForbiddenException('您没有权限访问该团队')
    }

    return taskWithTeam
  }

  /**
   * @description: 创建任务
   * @param {string} uid
   * @param {CreateTaskDto} createTaskDto
   * @return {*}
   */
  async create(uid: string, createTaskDto: CreateTaskDto) {
    const { start_time, end_time, project_id } = createTaskDto
    // 判断是否有权限创建任务
    const project = await this.projectService.checkTeamPermissionByProjectId(uid, project_id)
    if (project.status === ProjectStatus.Archive) {
      throw new BadRequestException('项目已归档，无法创建任务')
    }

    if (!this.checkTaskTimeIsReasonable(start_time, end_time)) {
      throw new BadRequestException('结束时间不能小于开始时间')
    }

    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        content: createTaskDto.content,
        project_id,
        creator_id: uid,
        process_type_id: createTaskDto.process_type_id,
        priority: createTaskDto.priority,
        start_time: start_time,
        end_time: end_time,
        reviewer_id: createTaskDto.reviewer_id,
        owner_ids: createTaskDto.owner_ids,
      },
      select: {
        task_id: true,
        title: true,
        content: true,
        project_id: true,
        creator: {
          select: {
            uid: true,
            name: true,
            avatar: true,
          }
        },
        process_type_id: true,
        priority: true,
        start_time: true,
        end_time: true,
        reviewer_id: true,
        owner_ids: true,
      }
    })
  }

  /**
   * @description: 获取项目下的所有任务
   * @param {string} uid
   * @param {SelectTaskDto} query
   * @return {*}
   */
  async findAllTasksOfProject(uid: string, query: SelectTaskDto) {
    const { project_id, order_by = 'createdAt', order_method = 'desc' } = query
    // 判断是否有权限查看任务列表
    await this.projectService.checkTeamPermissionByProjectId(uid, project_id)

    const tasks = await this.prisma.task.findMany({
      where: {
        project_id
      },
      select: {
        task_id: true,
        title: true,
        content: true,
        status: true,
        process_type: {
          select: {
            id: true,
            name: true,
          }
        },
        reviewer: {
          select: {
            uid: true,
            name: true,
            avatar: true,
          }
        },
        priority: true,
        start_time: true,
        end_time: true,
        owner_ids: true,
        createdAt: true,
      },
      orderBy: {
        [order_by]: order_method
      }
    })

    const threads = tasks.map(async (task) => {
      const ownerIds = task.owner_ids ? task.owner_ids.split(',') : []
      const restTaskInfo = {
        ...omit(task, ['owner_ids']),
        content: task.content ? `${filePathDomain}${task.content}` : task.content
      }

      if (!ownerIds.length) {
        return {
          ...restTaskInfo,
          owners: []
        }
      }

      const users = await this.prisma.user.findMany({
        where: {
          uid: {
            in: Array.from(new Set([...ownerIds]))
          },
          status: AccountStatus.Active
        },
        select: {
          uid: true,
          name: true,
          avatar: true,
        }
      })

      const owners = users.filter(user => ownerIds.includes(user.uid))
      return {
        ...restTaskInfo,
        owners
      }
    })

    const res = await Promise.all(threads)
    return res
  }

  /**
   * @description: 获取任务详情(因为目前数据字段还是比较少，暂时不用)
   * @param {string} uid
   * @param {string} taskId
   * @return {*}
   */
  async findTaskDetail(uid: string, taskId: string) {
    // 判断是否有权限查看任务详情
    await this.checkTeamPermissionByTaskId(uid, taskId)

    return this.prisma.task.findUnique({
      where: {
        task_id: taskId
      },
      select: {
        task_id: true,
        title: true,
        status: true,
        process_type_id: true,
        priority: true,
        start_time: true,
        end_time: true,
        reviewer_id: true,
        owner_ids: true,
        createdAt: true,
      }
    })
  }

  /**
   * @description: 更新任务
   * @param {string} uid
   * @param {string} taskId
   * @param {UpdateTaskDto} updateTaskDto
   * @return {*}
   */
  async update(uid: string, taskId: string, updateTaskDto: UpdateTaskDto) {
    // 判断是否有权限更新任务
    const task = await this.checkTeamPermissionByTaskId(uid, taskId)
    if (task.project.status === ProjectStatus.Archive) {
      throw new BadRequestException('项目已归档，无法更新任务')
    }

    const { start_time = task.start_time, end_time = task.end_time } = updateTaskDto
    if (!this.checkTaskTimeIsReasonable(start_time, end_time)) {
      throw new BadRequestException('结束时间不能小于开始时间')
    }

    this.prisma.task.update({
      where: {
        task_id: taskId
      },
      data: {
        title: updateTaskDto.title,
        content: updateTaskDto.content,
        process_type_id: updateTaskDto.process_type_id,
        priority: updateTaskDto.priority,
        start_time: updateTaskDto.start_time,
        end_time: updateTaskDto.end_time,
        reviewer_id: updateTaskDto.reviewer_id,
        owner_ids: updateTaskDto.owner_ids,
      }
    })

    return {
      code: 200,
      message: '更新成功'
    }
  }

  /**
   * @description: 删除任务
   * @param {string} uid
   * @param {string} taskId
   * @return {*}
   */
  async removeTask(uid: string, taskId: string) {
    // 判断是否有权限删除任务
    const task = await this.checkTeamPermissionByTaskId(uid, taskId)
    if (task.project.status === ProjectStatus.Archive) {
      throw new BadRequestException('项目已归档，无法更新任务')
    }


    await this.prisma.task.update({
      where: {
        task_id: taskId
      },
      data: {
        status: TaskStatus.Ban
      }
    })

    return {
      code: 200,
      message: '删除成功'
    }
  }
}
