import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { TeamService } from '../team/team.service'
import { PrismaService } from '../prisma/prisma.service'
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto, UpdateProjectStatusDto } from './dto/update-project.dto';
import { SelectProjectListDto } from './dto/select-project-list.dto';
import { ProjectStatus, TaskStatus } from '../helper/constants'

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
      console.log('projectWithTeam', projectWithTeam)
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

    return this.prisma.project.create({
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
    const taskCount = this.prisma.task.count({
      where: {
        project_id: projectId
      }
    })
    const doneTaskCount = this.prisma.task.count({
      where: {
        project_id: projectId,
        status: TaskStatus.Done
      }
    })

    const res = await Promise.all([taskCount, doneTaskCount])
    
    return {
      ...project,
      task_summary: {
        total: res[0],
        done_task_count: res[1]
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

    
    return this.prisma.project.findMany({
      where: {
        team_id: team_id,
        status: status as number
      },
      select: {
        project_id: true,
        name: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
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
