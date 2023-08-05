import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import MulterConfigService from '../helper/MulterConfigService'

@Module({
  imports: [MulterModule.registerAsync({
    useClass: MulterConfigService
  })],
  controllers: [CommonController],
  providers: [CommonService]
})
export class CommonModule {}
