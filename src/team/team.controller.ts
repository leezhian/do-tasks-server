import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post('/create')
  create(@Request() req, @Body() createTeamDto: CreateTeamDto) {
    const { uid } = req.user
    return this.teamService.create(uid, createTeamDto);
  }

  @Patch('/:id')
  update(@Request() req, @Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
    const { uid } = req.user
    return this.teamService.update(uid, id, updateTeamDto);
  }

  @Delete('/:id')
  remove(@Request() req, @Param('id') id: string) {
    const { uid } = req.user
    return this.teamService.remove(uid, id);
  }
}
