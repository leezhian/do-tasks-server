import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Query } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { SelectProjectListDto } from './dto/select-project-list.dto';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post('/create')
  createProject(@Request() req, @Body() createProjectDto: CreateProjectDto) {
    const { uid } = req.user
    return this.projectService.createProject(uid, createProjectDto);
  }

  @Patch('/:projectId')
  updateProject(@Request() req, @Param('projectId') projectId: string, @Body() updateProjectDto: UpdateProjectDto) {
    const { uid } = req.user
    return this.projectService.updateProject(uid, projectId, updateProjectDto);
  }

  @Get('/list')
  findProjects(@Request() req, @Query() query: SelectProjectListDto) {
    const { uid } = req.user
    return this.projectService.selectProjectsByIdAndStatus(uid, query);
  }

  @Delete(':projectId')
  removeProject(@Request() req, @Param('projectId') projectId: string) {
    const { uid } = req.user
    return this.projectService.removeProject(uid, projectId);
  }
}
