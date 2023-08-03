import { IsPhoneNumber, IsString, MinLength, MaxLength } from "class-validator"
import { UpdateUserDto } from "./update-user.dto"
export class CreateUserDto extends UpdateUserDto {
  @IsPhoneNumber('CN')
  readonly phone: string

  @IsString()
  @MinLength(8)
  @MaxLength(16)
  readonly password: string
}
