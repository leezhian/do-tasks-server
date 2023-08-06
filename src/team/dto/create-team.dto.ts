import { IsString, MaxLength, IsOptional, IsNotEmpty } from "class-validator"
import { Transform } from "class-transformer"

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  @Transform(({ value }) => value.trim())
  name: string;
  @IsOptional()
  @IsString()
  members?: string;
}
