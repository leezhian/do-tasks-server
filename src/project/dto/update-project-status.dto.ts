/*
 * @Author: kim
 * @Date: 2023-08-10 17:40:24
 * @Description: 
 */
import { Type } from "class-transformer"
import { IsIn } from "class-validator"
import { ProjectStatus } from "../../helper/constants"

export class UpdateProjectStatusDto {
  @Type(() => Number)
  @IsIn([ProjectStatus.Archive, ProjectStatus.Active, ProjectStatus.Ban])
  status?: number;
}
