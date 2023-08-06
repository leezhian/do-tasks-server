import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from '../helper/constants';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) { }

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
   * @description: 创建任务
   * @param {string} uid
   * @param {CreateTaskDto} createTaskDto
   * @return {*}
   */  
  async create(uid: string, createTaskDto: CreateTaskDto) {
    const { start_time, end_time, project_id } = createTaskDto
    // TODO 判断是否有权限创建任务

    if(!this.checkTaskTimeIsReasonable(start_time, end_time)) {
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
        reviewer_ids: createTaskDto.reviewer_ids,
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
            sex: true,
          }
        },
        process_type_id: true,
        priority: true,
        start_time: true,
        end_time: true,
        reviewer_ids: true,
        owner_ids: true,
      }
    })
  }

  /**
   * @description: 获取项目下的所有任务
   * @param {string} uid
   * @param {string} projectId
   * @return {*}
   */  
  findAllTasksOfProject(uid: string, projectId: string) {
    // TODO 判断是否有权限查看任务列表

    return this.prisma.task.findMany({
      where: {
        project_id: projectId
      },
      select: {
        task_id: true,
        title: true,
        status: true,
        process_type_id: true,
        priority: true,
        start_time: true,
        end_time: true,
        reviewer_ids: true,
        owner_ids: true,
        createdAt: true,
      }
    })
  }

  /**
   * @description: 获取任务详情
   * @param {string} uid
   * @param {string} taskId
   * @return {*}
   */  
  findTaskDetail(uid: string, taskId: string) {
    // TODO 判断是否有权限查看任务详情

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
        reviewer_ids: true,
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
  update(uid: string, taskId: string, updateTaskDto: UpdateTaskDto) {
    const { start_time, end_time } = updateTaskDto
    // TODO 判断是否有权限更新任务

    if(!this.checkTaskTimeIsReasonable(start_time, end_time)) {
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
        reviewer_ids: updateTaskDto.reviewer_ids,
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
    // TODO 判断是否有权限删除任务

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
