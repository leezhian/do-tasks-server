import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { PrismaService } from '../prisma/prisma.service'
import { TeamStatus } from '../helper/constants'

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * @description: 创建团队
   * @param {CreateTeamDto} createTeamDto
   * @return {*}
   */  
  create(uid: string, createTeamDto: CreateTeamDto) {
    return this.prisma.team.create({
      data: {
        name: createTeamDto.name,
        creator_id: uid,
        members: createTeamDto.members,
      },
      select: {
        team_id: true,
        name: true,
        creator_id: true,
        members: true,
      }
    })
  }

  async checkTeamExistAndRole(uid: string, teamId: string) {
    if(!teamId) {
      throw new BadRequestException('团队id不能为空')
    }

    const team = await this.prisma.team.findUnique({
      where: {
        team_id: teamId,
        status: TeamStatus.Active
      }
    })

    if(!team) {
      throw new BadRequestException('团队不存在')
    }

    if(team.creator_id !== uid) {
      throw new ForbiddenException('您没有权限修改该团队')
    }
  }

  /**
   * @description: 更新团队
   * @param {string} teamId 团队id
   * @param {UpdateTeamDto} updateTeamDto
   * @return {*}
   */  
  async update(uid: string, teamId: string, updateTeamDto: UpdateTeamDto) {
    await this.checkTeamExistAndRole(uid, teamId)

    await this.prisma.team.update({
      where: {
        team_id: teamId
      },
      data: {
        name: updateTeamDto.name,
        members: updateTeamDto.members,
      }
    })

    return {
      code: 200,
      message: '更新成功'
    }
  }

  /**
   * @description: 删除团队
   * @param {string} uid 用户uid
   * @param {string} teamId 团队id
   * @return {*}
   */  
  async remove(uid: string, teamId: string) {
    await this.checkTeamExistAndRole(uid, teamId)

    await this.prisma.team.update({
      where: {
        team_id: teamId
      },
      data: {
        status: TeamStatus.Ban
      }
    })

    return {
      code: 200,
      message: '删除成功'
    }
  }
}
