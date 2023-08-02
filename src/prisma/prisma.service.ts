import { Injectable, INestApplication, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  async enableShutdownHooks(app: INestApplication) {
    // 确保应用优雅关闭
    process.on('beforeExit', async () => {
      await app.close();
    })
  }
}