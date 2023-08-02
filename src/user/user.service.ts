import { Injectable } from '@nestjs/common';
import * as md5 from 'crypto-js/md5';
import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import type { UserInfo } from '../typings/user';
import type { ResponseData } from '../typings/base';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @description: 创建用户
   * @param {CreateUserDto} userInfo
   * @return {*}
   */  
  async createUser(userInfo: CreateUserDto): Promise<UserInfo> {
    const { password } = userInfo
    const encryptPassword = md5(password).toString()
    
    const user = await this.prisma.user.create({
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
    
    return user
  }

  /**
   * @description: 根据手机号获取用户信息
   * @param {string} phone
   * @return {*}
   */  
  async getUserInfoByPhone(phone: string): Promise<UserInfo> {
    const user = await this.prisma.user.findUnique({
      where: {
        phone: phone
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

    return user
  }

  /**
   * @description: 根据uid获取用户信息
   * @param {string} uid
   * @return {Promise<UserInfo>}
   */  
  async getUserInfoById(uid: string): Promise<ResponseData<Omit<UserInfo, 'password'>>> {
    const userInfo = await this.prisma.user.findUnique({
      where: {
        uid
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

    return {
      code: 200,
      msg: '成功',
      data: userInfo
    }
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
