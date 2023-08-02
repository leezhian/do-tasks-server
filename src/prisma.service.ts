/*
 * @Author: kim
 * @Date: 2023-08-02 11:33:54
 * @Description: 
 */
import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // Note: this is optional
    await this.$connect()
  }
}