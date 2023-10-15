import { BadRequestException, ForbiddenException, NotFoundException, Injectable } from '@nestjs/common'
import { pick } from 'lodash'
import { CreateTeamDto } from './dto/create-team.dto'
import { UpdateTeamDto } from './dto/update-team.dto'
import { PrismaService } from '../prisma/prisma.service'
import { TeamStatus } from '../helper/enum'

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * @description: 创建团队
   * @param {CreateTeamDto} createTeamDto
   * @return {*}
   */
  createTeam(uid: string, createTeamDto: CreateTeamDto) {
    return this.prisma.team.create({
      data: {
        name: createTeamDto.name,
        creator_id: uid,
        members: createTeamDto.members,
      },
      select: {
        team_id: true,
        name: true,
      }
    })
  }

  /**
   * @description: 根据团队id获取团队详情
   * @param {string} teamId
   * @return {*}
   */
  getActiveTeamById(teamId: string) {
    if (!teamId) {
      throw new BadRequestException('团队id不能为空')
    }

    return this.prisma.team.findUnique({
      where: {
        team_id: teamId,
        status: TeamStatus.Active
      }
    })
  }

  /**
   * @description: 根据团队id获取团队详情(且判断权限)
   * @param {string} uid
   * @param {string} teamId
   * @return {*}
   */  
  async getTeamById(uid: string, teamId: string) {
    const team = await this.checkTeamPermissionByTeamId(uid, teamId)
    let memberList = []
    if(team.members) {
      const memberIds = team.members.split(',')
      memberList = await this.prisma.user.findMany({
        where: {
          uid: { in: memberIds }
        },
        select: {
          uid: true,
          name: true,
          avatar: true
        }
      })
    }

    return {
      ...pick(team, ['name', 'team_id', 'creator_id']),
      members: memberList.map(item => ({
        label: item.name,
        value: item.uid,
        avatar: item.avatar
      }))
    }
  }

  /**
   * @description: 判断是否是团队成员
   * @param {string} uid 用户uid
   * @param {string} members 团队成员
   * @return {*}
   */
  isTeamMember(uid: string, members: string) {
    return (members ?? "").split(',').includes(uid)
  }

  /**
   * @description: 判断团队是否存在并且有权限
   * @param {string} uid
   * @param {string} teamId
   * @return {*}
   */
  async checkTeamPermissionByTeamId(uid: string, teamId: string) {
    const team = await this.getActiveTeamById(teamId)

    
    if (!team) {
      throw new NotFoundException('团队不存在')
    }

    if (team.creator_id !== uid && !this.isTeamMember(uid, team.members)) {
      throw new ForbiddenException('您没有权限访问该团队')
    }

    return team
  }

  /**
   * @description: 更新团队
   * @param {string} teamId 团队id
   * @param {UpdateTeamDto} updateTeamDto
   * @return {*}
   */
  async updateTeam(uid: string, teamId: string, updateTeamDto: UpdateTeamDto) {
    await this.checkTeamPermissionByTeamId(uid, teamId)

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
  async removeTeam(uid: string, teamId: string) {
    await this.checkTeamPermissionByTeamId(uid, teamId)

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

  /**
   * @description: 获取我的团队列表
   * @param {string} uid
   * @return {*}
   */
  getMyTeamList(uid: string) {
    return this.prisma.team.findMany({
      where: {
        status: TeamStatus.Active,
        OR: [{
          members: { contains: uid }
        }, {
          creator_id: uid
        }]
      },
      select: {
        team_id: true,
        name: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  /**
   * @description: 获取团队成员列表
   * @param {string} uid
   * @param {string} teamId
   * @return {*}
   */  
  async getTeamMembers(uid: string, teamId: string) {
    const team = await this.checkTeamPermissionByTeamId(uid, teamId)
    const memberArr = (team.members ?? '').split(',')

    return this.prisma.user.findMany({
      where: {
        status: TeamStatus.Active,
        OR: [{
          uid: {
            in: memberArr,
          }
        }, {
          uid: team.creator_id
        }]
      },
      select: {
        uid: true,
        name: true,
        avatar: true,
        phone: true
      }
    })
  }
}
