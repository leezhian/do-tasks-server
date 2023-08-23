import { Controller, Post, Get, UploadedFile, UseInterceptors, Query, HttpCode } from '@nestjs/common';
import { CommonService } from './common.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { SearchDto } from './dto/search.dto';
import { UserAuthInfo } from '../auth/auth.decorator';

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) { }

  @UseInterceptors(FileInterceptor('file'))
  @Post('/upload')
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.commonService.upload(file)
  }

  @Get('/search')
  @HttpCode(200)
  search(@UserAuthInfo('uid') uid: string, @Query() query: SearchDto) {
    return this.commonService.search(uid, query)
  }
}
