import { IsString, MinLength, MaxLength, IsUUID, IsOptional } from "class-validator"

export class CreateTeamDto {
  @IsString()
  @MinLength(1)
  @MaxLength(16)
  name: string;
  @IsOptional()
  @IsString()
  members?: string;
}
