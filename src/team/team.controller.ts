import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post('/create')
  createTeam(@Request() req, @Body() createTeamDto: CreateTeamDto) {
    const { uid } = req.user
    return this.teamService.createTeam(uid, createTeamDto);
  }

  @Get('/list')
  getMyTeamList(@Request() req) {
    const { uid } = req.user
    return this.teamService.getMyTeamList(uid);
  }

  @Patch('/:teamId')
  updateTeam(@Request() req, @Param('teamId') teamId: string, @Body() updateTeamDto: UpdateTeamDto) {
    const { uid } = req.user
    return this.teamService.updateTeam(uid, teamId, updateTeamDto);
  }

  @Delete('/:teamId')
  removeTeam(@Request() req, @Param('teamId') teamId: string) {
    const { uid } = req.user
    return this.teamService.removeTeam(uid, teamId);
  }
}
