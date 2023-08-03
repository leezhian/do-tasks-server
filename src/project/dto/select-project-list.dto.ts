/*
 * @Author: kim
 * @Date: 2023-08-04 00:15:51
 * @Description: 
 */
import { Type } from "class-transformer"
import { IsString, IsIn, IsNotEmpty, IsOptional } from "class-validator"
import { ProjectStatus } from "../../helper/constants"

export class SelectProjectListDto {
  @IsOptional()
  @Type(() => Number)
  @IsIn([ProjectStatus.Active, ProjectStatus.Archive])
  status: string;
  @IsNotEmpty()
  @IsString()
  team_id: string;
}
