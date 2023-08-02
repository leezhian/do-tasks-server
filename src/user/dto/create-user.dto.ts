import { Type } from "class-transformer"
import { IsPhoneNumber, IsString, MinLength, MaxLength, IsOptional, IsIn, IsInt } from "class-validator"

export class CreateUserDto {
  @IsPhoneNumber('CN')
  readonly phone: string
  // 可选字段
  @IsOptional()
  @IsString()
  readonly email?: string
  @IsOptional()
  @IsString()
  readonly name?: string
  @IsOptional()
  @IsString()
  readonly avatar?: string

  @IsString()
  @MinLength(8)
  @MaxLength(16)
  readonly password: string

  @IsOptional()
  @Type(() => Number)
  @IsIn([1, 2])
  readonly sex?: number
}
