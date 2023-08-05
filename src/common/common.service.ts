import { Injectable } from '@nestjs/common'
import { BadRequestException } from '@nestjs/common'
import { supportFileConfig, splitMime } from '../helper/MulterConfigService'

@Injectable()
export class CommonService {
  /**
   * @description: 文件上传
   * @param {Express} file
   * @return {*}
   */  
  upload(file: Express.Multer.File) {
    const { mimetype, size, path } = file
    const [filtType] = splitMime(mimetype)
    const limitFileSize = supportFileConfig[filtType].size
    if(size > limitFileSize) {
      throw new BadRequestException('上传的文件大小超过限制')
    }

    const fileUrl = path.replace(process.cwd(), '')
    return {
      filename: file.filename,
      url: fileUrl,
      mimetype,
      size
    }
  }
}
