import { IsNotEmpty, IsString, MaxLength, IsOptional, IsUrl, IsIn, IsInt } from "class-validator"
import { Transform, Type } from "class-transformer"
import { IsDateStamp } from '../../validator/isDateStamp.decorator'

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) => value.trim())
  title: string
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  content: string
  @IsNotEmpty()
  @IsString()
  project_id: string
  @IsInt()
  process_type_id: number
  @IsIn([0,1,2,3,4])
  priority?: number = 4
  @IsDateStamp()
  @Type(() => Number)
  start_time: number
  @IsDateStamp()
  @Type(() => Number)
  end_time: number
  @IsOptional()
  @IsString()
  reviewer_ids?: string
  @IsOptional()
  @IsString()
  owner_ids?: string
}