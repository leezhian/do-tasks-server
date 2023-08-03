import { Controller, Get, Patch, Body, Request, HttpStatus, HttpCode } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('/info')
  @HttpCode(HttpStatus.OK)
  getUserInfo(@Request() req) {    
    const { uid } = req.user
    return this.userService.getUserInfoById(uid)
  }

  @Patch('/update')
  @HttpCode(HttpStatus.OK)
  async update(@Request() req, @Body() body: UpdateUserDto) {
    const { uid } = req.user
    await this.userService.update(uid, body)
    
    return {
      code: 200,
      message: '更新成功'
    }
  }
}
