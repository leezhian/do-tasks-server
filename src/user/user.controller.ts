import { Controller, Get, Post, Body, Param, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('/create')
  create(@Body() userInfo: CreateUserDto) {
    return this.userService.createUser(userInfo);
  }

  @UseGuards(AuthGuard)
  @Get('/info')
  getUserInfo(@Request() req) {    
    const { uid } = req.user
    return this.userService.getUserInfoById(uid)
  }
}
