import { PartialType } from '@nestjs/mapped-types';
import { Type } from "class-transformer"
import { IsIn } from "class-validator"
import { CreateProjectDto } from './create-project.dto';
import { ProjectStatus } from "../../helper/enum"

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
}



export class UpdateProjectStatusDto {
  @Type(() => Number)
  @IsIn([ProjectStatus.Archive, ProjectStatus.Active, ProjectStatus.Ban])
  status?: number;
}