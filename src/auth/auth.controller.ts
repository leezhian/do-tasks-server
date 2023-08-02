import { Controller, Body, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auto.dto';
import { SkipAuth } from './auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @SkipAuth()
  @Post('/login')
  async loginOrRegister(@Body() body: AuthDto) {
    return this.authService.loginOrRegister(body)
  }
}
