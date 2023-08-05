/*
 * @Author: kim
 * @Date: 2023-08-05 15:40:52
 * @Description: multer配置
 */
import { dirname } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'
import { BadRequestException, Injectable } from "@nestjs/common";
import { MulterModuleOptions, MulterOptionsFactory } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import * as md5 from 'crypto-js/md5';
import * as dayjs from "dayjs";
import { uploadPath } from '../helper/constants'

export const supportFileConfig = {
  image: {
    size: 10 * 1024 * 1024,
    mime: ['image/png', 'image/jpeg', 'image/gif', 'image/bmp', 'image/webp'],
  },
  video: {
    size: 50 * 1024 * 1024,
    mime: ['video/mp4', 'video/avi', 'video/quicktime', 'video/webm', 'video/ogg'],
  },
  audio: {
    size: 20 * 1024 * 1024,
    mime: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/x-m4a', 'audio/aac'],
  },
  application: {
    size: 10 * 1024 * 1024,
    mime: ['application/pdf', 'application/msword', 'application/vnd.ms-excel', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain']
  }
}

/**
 * @description: 分割mime
 * @param {string} mimetype
 * @return {Array<string>}
 */
export const splitMime = (mimetype: string) => {
  return mimetype.split('/')
}

/**
 * @description: 创建目录
 * @param {string} dirPath
 * @return {boolean}
 */
export function mkdirsSync(dirPath: string) {
  if (existsSync(dirPath)) {
    return true
  } else {
    if (mkdirsSync(dirname(dirPath))) {
      mkdirSync(dirPath)
      return true
    }
  }
}

@Injectable()
class MulterConfigService implements MulterOptionsFactory {

  createMulterOptions(): MulterModuleOptions {
    return {
      storage: diskStorage({
        // 存储处理
        destination: (req, file, cb) => {
          const { mimetype } = file
          const [fileType] = splitMime(mimetype)
          // 上传路径
          const filePath = `${uploadPath}/${fileType}/${dayjs().format('YYYY-MM-DD')}`
          // 如果目录不存在则创建
          mkdirsSync(filePath)
          cb(null, filePath)
        },
        // 文件名处理
        filename: (req, file, cb) => {
          const { originalname } = file
          const [name, ...rest] = originalname.split('.')
          const encryptFilename = md5(`${name}-${Date.now()}`).toString()
          cb(null, `${encryptFilename}.${rest[rest.length - 1]}`)
        },
      }),
      fileFilter: (req, file, cb) => {
        const { mimetype } = file
        const [filtType] = splitMime(mimetype)

        if (!supportFileConfig[filtType] || !supportFileConfig[filtType].mime.includes(mimetype)) {
          cb(new BadRequestException('不支持该文件类型'), false)
          return
        }

        cb(null, true)
      },
    }
  }
}

export default MulterConfigService;