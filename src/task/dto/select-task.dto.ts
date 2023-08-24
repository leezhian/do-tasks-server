/*
 * @Author: kim
 * @Date: 2023-08-21 23:12:33
 * @Description: 查询任务列表
 */
import { Type } from "class-transformer"
import { IsNotEmpty, IsString, IsOptional, IsIn, IsEnum, IsNumberString, IsInt } from "class-validator"
import { TaskStatus } from "../../helper/enum"

export class SelectTaskDto {
  @IsNotEmpty()
  @IsString()
  project_id: string
  @IsOptional()
  @IsIn(['priority', 'start_time', 'end_time', 'createdAt'])
  order_by?: string
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order_method?: string
  @IsOptional()
  @Type(() => Number)
  @IsEnum(TaskStatus)
  status?: number
  @IsOptional()
  @Type(() => Number)
  @IsIn([0, 1])
  object?: number
}