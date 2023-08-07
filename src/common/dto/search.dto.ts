/*
 * @Author: kim
 * @Date: 2023-08-07 15:30:58
 * @Description: 
 */
import { IsString, IsOptional, IsIn } from "class-validator"

export class SearchDto {
  @IsString()
  keyword: string
  @IsOptional()
  @IsIn(["", "1", "2"])
  type?: string // 查询类型
}