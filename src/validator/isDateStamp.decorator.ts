/*
 * @Author: kim
 * @Date: 2023-08-05 21:21:05
 * @Description: 验证是否为时间戳
 */
import { registerDecorator, ValidationOptions, ValidationArguments } from "class-validator"

export function IsDateStamp(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isDateStamp",
      target: object.constructor,
      propertyName: propertyName,
      options: {
        ...validationOptions,
        message: `${propertyName} is not timestamp`
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const reg = /^\d+$/          
          return reg.test(value)
        }
      }
    })
  }
}