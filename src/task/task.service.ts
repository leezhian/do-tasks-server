import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) { }

  create(uid: string, createTaskDto: CreateTaskDto) {
    const { start_time, end_time, project_id } = createTaskDto
    // TODO 判断是否有权限创建任务

    if(end_time < start_time) {
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
      } as any,
      select: {
        task_id: true,
        title: true,
        content: true,
        project_id: true,
        creator_id: true,
        process_type_id: true,
        priority: true,
        start_time: true,
        end_time: true,
        reviewer_ids: true,
        owner_ids: true,
      }
    })
  }

  findAll() {
    return `This action returns all task`;
  }

  findOne(id: number) {
    return `This action returns a #${id} task`;
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`;
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }
}
