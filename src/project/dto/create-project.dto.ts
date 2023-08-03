import { IsString, MaxLength, IsNotEmpty } from "class-validator"

export class CreateProjectDto {
  @IsNotEmpty()
  @MaxLength(30)
  name: string;
  @IsNotEmpty()
  @IsString()
  team_id: string;
}
