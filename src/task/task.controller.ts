import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { SelectTaskDto } from './dto/select-task.dto';
import { UserAuthInfo } from '../auth/auth.decorator'

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post('/create')
  create(@UserAuthInfo('uid') uid: string, @Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(uid, createTaskDto);
  }

  @Get("/list")
  findAll(@UserAuthInfo('uid') uid: string, @Query() query: SelectTaskDto) {
    return this.taskService.findAllTasksOfProject(uid, query)
  }

  @Get(':task_id')
  findTaskDetail(@UserAuthInfo('uid') uid: string, @Param('task_id') taskId: string) {
    return this.taskService.findTaskDetail(uid, taskId);
  }

  @Patch(':task_id')
  update(@UserAuthInfo('uid') uid: string, @Param('task_id') taskId: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(uid, taskId, updateTaskDto);
  }

  @Delete(':task_id')
  removeTask(@UserAuthInfo('uid') uid: string, @Param('task_id') taskId: string) {
    return this.taskService.removeTask(uid, taskId);
  }
}
