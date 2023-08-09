import { Controller, Get, Patch, Body, HttpStatus, HttpCode, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserAuthInfo } from '../auth/auth.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('/info')
  @HttpCode(HttpStatus.OK)
  getUserInfo(@UserAuthInfo('uid') uid: string) {    
    return this.userService.getUserInfoById(uid)
  }

  @Patch('/update')
  @HttpCode(HttpStatus.OK)
  async update(@UserAuthInfo('uid') uid: string, @Body() body: UpdateUserDto) {
    await this.userService.update(uid, body)
    
    return {
      code: 200,
      message: '更新成功'
    }
  }

  @Get('/search')
  searchUser(@UserAuthInfo('uid') uid: string , @Query('keyword') keyword: string) {
    return this.userService.searchUser(uid, keyword)
  }
}
