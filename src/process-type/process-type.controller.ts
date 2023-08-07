import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { ProcessTypeService } from './process-type.service';
import { CreateProcessTypeDto } from './dto/create-process-type.dto';
import { SelectProcessTypesDto } from './dto/select-process-types.dto';
import { UserAuthInfo } from '../auth/auth.decorator';

@Controller('process-type')
export class ProcessTypeController {
  constructor(private readonly processTypeService: ProcessTypeService) {}

  @Post('/create')
  create(@UserAuthInfo('uid') uid: string, @Body() createProcessTypeDto: CreateProcessTypeDto) {
    return this.processTypeService.create(uid, createProcessTypeDto);
  }

  @Get('/list')
  findAllProcessType(@UserAuthInfo('uid') uid: string, @Query() query: SelectProcessTypesDto) {
    return this.processTypeService.findAllProcessType(uid, query);
  }

  @Delete(':id')
  remove(@UserAuthInfo('uid') uid: string, @Param('id') id: string) {
    return this.processTypeService.remove(uid, +id);
  }
}
