import { PartialType } from '@nestjs/mapped-types';
import { Type } from "class-transformer"
import { IsOptional, IsIn } from "class-validator"
import { CreateProjectDto } from './create-project.dto';
import { ProjectStatus } from "../../helper/constants"

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsOptional()
  @Type(() => Number)
  @IsIn([ProjectStatus.Archive, ProjectStatus.Active, ProjectStatus.Ban])
  status?: number;
}
