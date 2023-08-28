import { omit } from 'lodash';
import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
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
   * @description: 计算任务列表的查询条件
   * @param {string} uid
   * @param {SelectTaskDto} query
   * @return {*}
   */  
  private computedSelectConditionOfList(uid: string, query: SelectTaskDto) {
    const { project_id, object, status } = query
    let selectCondition: any = {
      project_id,
      status: {
        not: TaskStatus.Ban
      }
    }

    /*
      remark 0表示查询所有的，1表示只查询自己的
      status 1实际表示查询 1和 3的， 因为 3 时审核不通过，即需要返回来重做，其余的都是查询自己的
      当object为1时，status为1，需要额外条件 owner_ids（负责人）需要包含自己 uid；status为2时，需要额外条件 owner_ids（负责人）需要包含自己 uid 或者 reviewer_id（审核人）为自己 uid，即自己负责的或者自己审核的。status为3时与 2 一样。
    */

    // 表示只查询自己的
    if (object === 1) {
      if(status === TaskStatus.Todo) {
        selectCondition.owner_ids = {
          contains: uid
        }
      } else {
        selectCondition['OR'] = [
          {
            owner_ids: {
              contains: uid
            }
          },
          {
            reviewer_id: uid
          }
        ]

      }
    }

    // 进行中，包括待处理和审核不通过
    if (status === TaskStatus.Todo) {
      selectCondition.status = {
        in: [TaskStatus.Todo, TaskStatus.ReviewFailed]
      }
    } else {
      selectCondition.status = status
    }

    return selectCondition
  }

  /**
   * @description: 获取项目下的所有任务
   * @param {string} uid
   * @param {SelectTaskDto} query
   * @return {*}
   */
  async findAllTasksOfProject(uid: string, query: SelectTaskDto) {
    const { project_id, order_by = 'createdAt', order_method = 'desc', page = 1, page_size = 20 } = query
    // 判断是否有权限查看任务列表
    await this.projectService.checkTeamPermissionByProjectId(uid, project_id)

    const selectCondition = this.computedSelectConditionOfList(uid, query)

    const [tasks, tasksToast] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where: {
          ...selectCondition
        },
        skip: (page - 1) * page_size,
        take: page_size,
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
          _count: true
        },
        orderBy: {
          [order_by]: order_method
        }
      }),
      this.prisma.task.count({
        where: {
          ...selectCondition
        }
      })
    ])

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
    return {
      list: res,
      total: tasksToast
    }
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
  async updateTask(uid: string, taskId: string, updateTaskDto: UpdateTaskDto) {
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
   * @description: 更新任务状态
   * @param {string} uid
   * @param {string} taskId
   * @param {UpdateTaskStatusDto} updateTaskStatusDto
   * @return {*}
   */  
  async updateTaskStatus(uid: string, taskId: string, updateTaskStatusDto: UpdateTaskStatusDto) {
    const { status } = updateTaskStatusDto
    // 判断是否有权限查看任务详情
    const task = await this.checkTeamPermissionByTaskId(uid, taskId)
    const { status : currentTaskStatus } = task

    // 表示非审核中状态，越级修改状态提示报错
    if(currentTaskStatus !== TaskStatus.UnderReview && status > currentTaskStatus + 1) {
      throw new BadRequestException('禁止越级修改任务状态')
    }

    let updateData = {
      status
    }

    if (status === TaskStatus.UnderReview) {
      // 更新为审核中时，表示任务已经完成，需记录完成时间
      updateData['done_task_time'] = dayjs().unix()
    } else if (status === TaskStatus.Done) {
      // 记录审核通过时间
      updateData['approved_task_time'] = dayjs().unix()
    }
    
    await this.prisma.task.update({
      where: {
        task_id: taskId
      },
      data: updateData
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
