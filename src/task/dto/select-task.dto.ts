/*
 * @Author: kim
 * @Date: 2023-08-21 23:12:33
 * @Description: 查询任务列表
 */
import { IsNotEmpty, IsString, IsOptional, IsIn } from "class-validator"

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
}