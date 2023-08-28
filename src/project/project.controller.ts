import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto, UpdateProjectStatusDto } from './dto/update-project.dto';
import { SelectProjectListDto } from './dto/select-project-list.dto';
import { UserAuthInfo } from '../auth/auth.decorator';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post('/create')
  createProject(@UserAuthInfo('uid') uid: string, @Body() createProjectDto: CreateProjectDto) {
    return this.projectService.createProject(uid, createProjectDto);
  }

  @Patch('/:projectId')
  updateProject(@UserAuthInfo('uid') uid: string, @Param('projectId') projectId: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.updateProject(uid, projectId, updateProjectDto);
  }

  @Patch('/:projectId/status')
  updateProjectStatus(@UserAuthInfo('uid') uid: string, @Param('projectId') projectId: string, @Body() updateProjectStatusDto: UpdateProjectStatusDto) {
    return this.projectService.updateProjectStatus(uid, projectId, updateProjectStatusDto)
  }

  @Get('/list')
  findProjects(@UserAuthInfo('uid') uid: string, @Query() query: SelectProjectListDto) {
    return this.projectService.selectProjectsByIdAndStatus(uid, query);
  }

  @Get('/:projectId/task-status-summary')
  getTaskStautsSummary(@UserAuthInfo('uid') uid: string, @Param('projectId') projectId: string) {
    return this.projectService.getTaskStautsSummary(uid, projectId)
  }

  @Get('/:projectId')
  findProjectDetail(@UserAuthInfo('uid') uid: string, @Param('projectId') projectId: string) {
    return this.projectService.selectProjectById(uid, projectId)
  }

  @Delete('/:projectId')
  removeProject(@UserAuthInfo('uid') uid: string, @Param('projectId') projectId: string) {
    return this.projectService.removeProject(uid, projectId);
  }
}
