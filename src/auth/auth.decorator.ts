/*
 * @Author: kim
 * @Date: 2023-08-03 01:14:05
 * @Description: 用于跳过jwt验证，自定义装饰器
 */
import { SetMetadata } from '@nestjs/common';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const SkipAuth = () => SetMetadata(IS_PUBLIC_KEY, true) // 设置元数据键值对

/**
 * @description: 用于获取用户授权信息（token解析后会放在 req.user）,此装饰器是为了方便获取
 * @return {any}
 */
export const UserAuthInfo = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user

  return data ? user[data] : user
})