import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { UserAuthInfo } from '../auth/auth.decorator';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post('/create')
  createTeam(@UserAuthInfo('uid') uid: string, @Body() createTeamDto: CreateTeamDto) {
    return this.teamService.createTeam(uid, createTeamDto);
  }

  @Get('/list')
  getMyTeamList(@UserAuthInfo('uid') uid: string) {
    return this.teamService.getMyTeamList(uid);
  }

  @Get('/members')
  getTeamMembers(@UserAuthInfo('uid') uid: string, @Query('team_id') teamId: string) {
    return this.teamService.getTeamMembers(uid, teamId);
  }

  @Get('/:team_id')
  getTeamInfo(@UserAuthInfo('uid') uid: string, @Param('team_id') teamId: string) {
    return this.teamService.getTeamById(uid, teamId);
  }

  @Patch('/:team_id')
  updateTeam(@UserAuthInfo('uid') uid: string, @Param('team_id') teamId: string, @Body() updateTeamDto: UpdateTeamDto) {
    return this.teamService.updateTeam(uid, teamId, updateTeamDto);
  }

  @Delete('/:team_id')
  removeTeam(@UserAuthInfo('uid') uid: string, @Param('team_id') teamId: string) {
    return this.teamService.removeTeam(uid, teamId);
  }
}
