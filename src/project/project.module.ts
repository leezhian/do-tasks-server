import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { TeamModule } from '../team/team.module'

@Module({
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
  imports: [TeamModule]
})
export class ProjectModule {}
