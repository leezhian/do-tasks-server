import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('/info')
  getUserInfo(@Request() req) {    
    const { uid } = req.user
    return this.userService.getUserInfoById(uid)
  }
}
