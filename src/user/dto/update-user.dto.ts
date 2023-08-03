import { Type } from "class-transformer"
import { IsString, IsOptional, IsIn } from "class-validator"

export class UpdateUserDto {
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

  @IsOptional()
  @Type(() => Number)
  @IsIn([1, 2])
  readonly sex?: number
}
