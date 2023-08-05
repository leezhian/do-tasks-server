import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TeamModule } from './team/team.module';
import { ProjectModule } from './project/project.module';
import { ProcessTypeModule } from './process-type/process-type.module';
import { TaskModule } from './task/task.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule, TeamModule, ProjectModule, ProcessTypeModule, TaskModule, CommonModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    }
  ],
})
export class AppModule {}
