import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { TeamService } from '../team/team.service'
import { PrismaService } from '../prisma/prisma.service'
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { SelectProjectListDto } from './dto/select-project-list.dto';
import { ProjectStatus } from '../helper/constants'

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService, private readonly teamService: TeamService) { }

  /**
   * @description: 创建项目
   * @param {string} uid
   * @param {CreateProjectDto} createProjectDto
   * @return {*}
   */  
  async createProject(uid: string, createProjectDto: CreateProjectDto) {
    const { team_id } = createProjectDto
    await this.teamService.checkTeamExistAndPermission(uid, team_id)

    return this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        team_id: team_id
      },
      select: {
        project_id: true,
        name: true,
      }
    })
  }

  /**
   * @description: 根据项目id获取项目信息
   * @param {string} project_id
   * @return {*}
   */  
  getProjectById(projectId: string) {
    if(!projectId) {
      throw new BadRequestException('项目不存在')
    }

    return this.prisma.project.findUnique({
      where: {
        project_id: projectId,
        status: {
          not: ProjectStatus.Ban
        }
      }
    })
  }

  /**
   * @description: 修改项目信息
   * @param {string} uid 用户id
   * @param {string} projectId 项目id
   * @param {UpdateProjectDto} updateProjectDto
   * @return {*}
   */  
  async updateProject(uid: string, projectId: string, updateProjectDto: UpdateProjectDto) {
    const project = await this.getProjectById(projectId)
    if(!project) {
      throw new NotFoundException('项目不存在')
    } else if(project.status !== ProjectStatus.Active) {
      throw new BadRequestException('项目已归档')
    }

    await this.teamService.checkTeamExistAndPermission(uid, project.team_id).catch(() => {
      throw new ForbiddenException('您没有权限删除该项目')
    })

    await this.prisma.project.update({
      where: {
        project_id: projectId
      },
      data: {
        name: updateProjectDto.name,
        status: updateProjectDto.status
      }
    })

    return {
      code: 200,
      message: '更新成功'
    }
  }

  async selectProjectsByIdAndStatus(uid: string, query: SelectProjectListDto) {
    const { team_id, status = ProjectStatus.Active } = query
    await this.teamService.checkTeamExistAndPermission(uid, team_id)

    return this.prisma.project.findMany({
      where: {
        team_id: team_id,
        status: status as number
      },
      select: {
        project_id: true,
        name: true,
        team_id: true,
        status: true
      }
    })
  }

  /**
   * @description: 删除项目
   * @param {string} projectId
   * @return {*}
   */  
  async removeProject(uid: string, projectId: string) {
    const project = await this.getProjectById(projectId)
    if(!project) {
      throw new NotFoundException('项目不存在')
    }

    await this.teamService.checkTeamExistAndPermission(uid, project.team_id).catch(() => {
      throw new ForbiddenException('您没有权限删除该项目')
    })

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
