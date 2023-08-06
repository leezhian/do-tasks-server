import { IsString, MaxLength, IsNotEmpty } from "class-validator"
import { Transform } from "class-transformer"

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  @Transform(({ value }) => value.trim())
  name: string;
  @IsNotEmpty()
  @IsString()
  team_id: string;
}
