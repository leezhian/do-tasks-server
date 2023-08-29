/*
 * @Author: kim
 * @Date: 2023-08-30 01:24:56
 * @Description: 任务汇总相关
 */
import { Type } from "class-transformer"
import { IsOptional, IsIn } from "class-validator"

export class SelectTaskStatusSummaryDto {
  @IsOptional()
  @Type(() => Number)
  @IsIn([0, 1])
  object?: number
}