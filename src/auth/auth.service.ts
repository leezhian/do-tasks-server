import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'
import { omit } from 'lodash'
import { UserService } from '../user/user.service';
import { AuthDto } from './dto/auto.dto';
import * as md5 from 'crypto-js/md5';
import type { UserInfo } from '../typings/user'

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService, private readonly jwtService: JwtService) { }

  /**
   * @description: 登录或注册
   * @param {AuthDto} payload
   * @return {Promise}
   */  
  async loginOrRegister(payload: AuthDto) {
    const { phone, password } = payload
    let userInfo: UserInfo = await this.userService.getUserInfoByPhone(phone)

    if (userInfo) {
      const inputPwd = md5(password).toString()
      if (userInfo.password !== inputPwd) {
        throw new UnauthorizedException('密码错误')
      }
    } else {
      userInfo = await this.userService.createUser(payload)
    }

    // 生成token
    const token = await this.jwtService.signAsync({ uid: userInfo.uid, phone: userInfo.phone })
    userInfo.token = token

    return omit(userInfo, ['password'])
  }
}
