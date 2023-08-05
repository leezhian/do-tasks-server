import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CommonService } from './common.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) { }

  @UseInterceptors(FileInterceptor('file'))
  @Post('/upload')
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return file
  }
}
