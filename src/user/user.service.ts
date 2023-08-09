import { Injectable } from '@nestjs/common';
import * as md5 from 'crypto-js/md5';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import type { UserInfo } from '../typings/user';
import { AccountStatus } from '../helper/constants'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * @description: 创建用户
   * @param {CreateUserDto} userInfo
   * @return {Promise<UserInfo>}
   */
  async createUser(userInfo: CreateUserDto): Promise<UserInfo> {
    const { password } = userInfo
    const encryptPassword = md5(password).toString()

    return this.prisma.user.create({
      data: {
        name: userInfo.name ?? `未命名${Date.now()}`,
        phone: userInfo.phone,
        email: userInfo.email,
        avatar: userInfo.avatar,
        sex: userInfo.sex,
        password: encryptPassword,
      },
      select: {
        uid: true,
        phone: true,
        email: true,
        name: true,
        avatar: true,
        password: true,
        sex: true,
      }
    })
  }

  /**
   * @description: 根据手机号获取用户信息
   * @param {string} phone
   * @return {Promise<UserInfo>}
   */
  async getUserInfoByPhone(phone: string): Promise<UserInfo> {
    return this.prisma.user.findUnique({
      where: {
        phone: phone,
        status: AccountStatus.Active
      },
      select: {
        uid: true,
        phone: true,
        email: true,
        name: true,
        avatar: true,
        password: true,
        sex: true,
      }
    })
  }

  /**
   * @description: 根据手机号搜索用户
   * @param {string} phone 
   * @return {*}
   */  
  searchUser(uid: string, keyword: string) {
    return this.prisma.user.findMany({
      where: {
        phone: keyword,
        uid: {
          not: uid
        },
        status: AccountStatus.Active
      },
      select: {
        uid: true,
        name: true,
        avatar: true,
        sex: true,
      }
    })
  }

  /**
   * @description: 根据uid获取用户信息
   * @param {string} uid
   * @return {Promise<UserInfo>}
   */
  async getUserInfoById(uid: string): Promise<Omit<UserInfo, 'password'>>  {
    return this.prisma.user.findUnique({
      where: {
        uid,
        status: AccountStatus.Active
      },
      select: {
        uid: true,
        phone: true,
        email: true,
        name: true,
        avatar: true,
        sex: true,
      }
    })
  }

  /**
   * @description: 修改用户信息
   * @param {string} uid 
   * @param {UpdateUserDto} payload
   * @return {*}
   */  
  async update(uid: string, payload: UpdateUserDto) {
    return this.prisma.user.update({
      where: {
        uid,
        status: AccountStatus.Active
      },
      data: {
        ...payload
      }
    })
  }
}
