import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TeamService } from '../team/team.service';
import { CreateProcessTypeDto } from './dto/create-process-type.dto';
import { SelectProcessTypesDto } from './dto/select-process-types.dto';
import { ProcessTypeStatus } from '../helper/constants';

@Injectable()
export class ProcessTypeService {
  constructor(private readonly prisma: PrismaService, private readonly teamService:TeamService) {}

  /**
   * @description: 创建流程类型
   * @param {string} uid 用户id
   * @param {CreateProcessTypeDto} createProcessTypeDto
   * @return {*}
   */  
  async create(uid: string, createProcessTypeDto: CreateProcessTypeDto) {
    await this.teamService.checkTeamPermissionByTeamId(uid, createProcessTypeDto.team_id)

    return this.prisma.processType.create({
      data: {
        name: createProcessTypeDto.name,
        team_id: createProcessTypeDto.team_id
      },
      select: {
        id: true,
        name: true,
      }
    })
  }

  /**
   * @description: 获取流程类型列表
   * @param {string} uid 用户id
   * @param {SelectProcessTypesDto} query
   * @return {*}
   */  
  async findAllProcessType(uid: string, query: SelectProcessTypesDto) {
    const { team_id } = query
    await this.teamService.checkTeamPermissionByTeamId(uid, team_id)

    return this.prisma.processType.findMany({
      where: {
        team_id,
        status: ProcessTypeStatus.Active
      },
      select: {
        id: true,
        name: true
      }
    })
  }

  /**
   * @description: 根据id获取流程类型
   * @param {number} id
   * @return {*}
   */  
  getProcessTypeById(id: number) {
    return this.prisma.processType.findUnique({
      where: {
        id,
        status: ProcessTypeStatus.Active
      }
    })
  }

  /**
   * @description: 删除流程类型
   * @param {string} uid
   * @param {number} processTypeId
   * @return {*}
   */  
  async remove(uid: string, processTypeId: number) {
    const processType = await this.getProcessTypeById(processTypeId)
    if(!processType) {
      throw new NotFoundException('流程类型不存在')
    }

    await this.teamService.checkTeamPermissionByTeamId(uid, processType.team_id)
    await this.prisma.processType.update({
      where: {
        id: processTypeId
      },
      data: {
        status: ProcessTypeStatus.Ban
      }
    })

    return {
      code: 200,
      message: '删除成功'
    }
  }
}
