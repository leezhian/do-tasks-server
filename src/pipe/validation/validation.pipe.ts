/*
 * @Author: kim
 * @Date: 2023-08-02 13:27:41
 * @Description: 校验通道
 */
import { ArgumentMetadata, Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata
    
    // 没有验证规则则不验证
    if (!metatype || !this.toValidate(metatype)) {
      return value
    }

    const object = plainToClass(metatype, value)
    const errors = await validate(object)

    if (errors.length > 0) {
      const msg = Object.values(errors[0].constraints)[0]
      throw new BadRequestException(`Validation failed: ${msg}`)
    }
    // 为了获取到的是转换数据
    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
