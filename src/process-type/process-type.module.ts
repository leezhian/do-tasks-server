import { Module } from '@nestjs/common';
import { ProcessTypeService } from './process-type.service';
import { ProcessTypeController } from './process-type.controller';
import { TeamModule } from './../team/team.module';

@Module({
  controllers: [ProcessTypeController],
  providers: [ProcessTypeService],
  imports: [TeamModule]
})
export class ProcessTypeModule {}
