import { IsPhoneNumber, IsString, MinLength, MaxLength } from "class-validator"

export class AuthDto {
  @IsPhoneNumber('CN')
  phone: string;
  @IsString()
  @MinLength(8)
  @MaxLength(16)
  password: string;
}