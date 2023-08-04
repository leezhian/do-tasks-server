import { IsString, MaxLength, IsNotEmpty } from "class-validator";

export class CreateProcessTypeDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  name: string
  @IsNotEmpty()
  @IsString()
  team_id: string;
}
