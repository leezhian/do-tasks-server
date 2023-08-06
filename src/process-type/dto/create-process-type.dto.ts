import { IsString, MaxLength, IsNotEmpty } from "class-validator";
import { Transform } from "class-transformer"

export class CreateProcessTypeDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  @MaxLength(10)
  name: string
  @IsNotEmpty()
  @IsString()
  team_id: string;
}
