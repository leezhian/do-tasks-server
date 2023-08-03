import { IsString, MinLength, MaxLength, IsOptional } from "class-validator"

export class CreateTeamDto {
  @IsString()
  @MinLength(1)
  @MaxLength(16)
  name: string;
  @IsOptional()
  @IsString()
  members?: string;
}
