import { Injectable } from '@nestjs/common'
import { BadRequestException } from '@nestjs/common'
import { supportFileConfig, splitMime } from '../helper/MulterConfigService'
import { SearchDto } from './dto/search.dto'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CommonService {
  constructor(private readonly prisma: PrismaService) { }
  /**
   * @description: 文件上传
   * @param {Express} file
   * @return {*}
   */
  upload(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('文件不存在')
    }

    const { mimetype, size, path } = file
    const [filtType] = splitMime(mimetype)
    const limitFileSize = supportFileConfig[filtType].size
    if (size > limitFileSize) {
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

  /**
   * @description: 搜索(支持搜索团队和任务)
   * @param {string} uid
   * @param {SearchDto} query
   * @return {*}
   */
  search(uid: string, query: SearchDto) {
    const { keyword, type } = query

    let sql = ''
    if (!type || type === '1') {
      sql += `select team_id as id, name, '1' as type from Team where name like '%${keyword}%' and (creator_id = '${uid}' or members like '%${uid}%')`
    }

    if (!type || type === '2') {
      if (sql) {
        sql += ' union all '
      }
      sql += `select task_id as id, title as name, '2' as type from Task join Project join Team where title like '%${keyword}%' and Task.project_id = Project.project_id and Project.team_id = Team.team_id and (Team.creator_id = '${uid}' or Team.members like '%${uid}%')`
    }

    if (!type) {
      sql = `(${sql})`
    }

    sql += ' limit 20;'
    return this.prisma.$queryRawUnsafe(sql)
  }
}
