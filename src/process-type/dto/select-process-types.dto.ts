import { IsString, IsNotEmpty } from "class-validator";

export class SelectProcessTypesDto {
  @IsNotEmpty()
  @IsString()
  team_id: string;
}
