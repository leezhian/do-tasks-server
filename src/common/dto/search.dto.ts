/*
 * @Author: kim
 * @Date: 2023-08-07 15:30:58
 * @Description: 
 */
import { Type } from "class-transformer"
import { IsString, IsOptional, IsIn, IsInt, Min } from "class-validator"

export class SearchDto {
  @IsString()
  keyword: string
  @IsOptional()
  @IsIn(["", "1", "2"])
  type?: string // 查询类型
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number
}