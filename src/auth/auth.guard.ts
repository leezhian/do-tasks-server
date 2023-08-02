import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    console.log('12312312asdasdasdasdasdasd');
    

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
