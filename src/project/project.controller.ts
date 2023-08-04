import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
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

  @Get('/list')
  findProjects(@UserAuthInfo('uid') uid: string, @Query() query: SelectProjectListDto) {
    return this.projectService.selectProjectsByIdAndStatus(uid, query);
  }

  @Delete(':projectId')
  removeProject(@UserAuthInfo('uid') uid: string, @Param('projectId') projectId: string) {
    return this.projectService.removeProject(uid, projectId);
  }
}
