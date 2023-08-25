/*
 * @Author: kim
 * @Date: 2023-08-25 13:46:29
 * @Description: 
 */
import { IsEnum } from 'class-validator';
import { TaskStatus } from '../../helper/enum'

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  status: number
}
