/*
 * @Author: kim
 * @Date: 2023-08-02 19:19:44
 * @Description: 鉴权守卫
 */
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express'
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './auth.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService, private readonly reflector: Reflector) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    // remark 读取路由中的 元数据，context.getHandler 获取方法的，context.getClass 获取类的，可能类和方法都定义了，因此使用 getAllAndOverride 方法，获取所有元数据然后根据优先级覆盖。
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if(!token) {
      throw new UnauthorizedException('请先登录再操作')
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET
      });

      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException('登录已过期或非法字符串')
    }

    return true;
  }

  /**
   * @description: 提取token
   * @param {Request} request 请求头
   * @return {string}
   */
  extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
