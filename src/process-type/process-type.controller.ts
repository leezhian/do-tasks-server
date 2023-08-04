import { Controller, Get, Post, Body, Param, Delete, Request, Query } from '@nestjs/common';
import { ProcessTypeService } from './process-type.service';
import { CreateProcessTypeDto } from './dto/create-process-type.dto';
import { SelectProcessTypesDto } from './dto/select-process-types.dto';

@Controller('process-type')
export class ProcessTypeController {
  constructor(private readonly processTypeService: ProcessTypeService) {}

  @Post('/create')
  create(@Request() req, @Body() createProcessTypeDto: CreateProcessTypeDto) {
    const { uid } = req.user;
    return this.processTypeService.create(uid, createProcessTypeDto);
  }

  @Get('/list')
  findAll(@Request() req, @Query() query: SelectProcessTypesDto) {
    const { uid } = req.user;
    return this.processTypeService.findAll(uid, query);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    const { uid } = req.user;
    return this.processTypeService.remove(uid, +id);
  }
}
