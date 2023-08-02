/*
 * @Author: kim
 * @Date: 2023-08-03 01:14:05
 * @Description: 用于跳过jwt验证，自定义装饰器
 */
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const SkipAuth = () => SetMetadata(IS_PUBLIC_KEY, true) // 设置元数据键值对