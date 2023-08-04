import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
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

  @Patch('/:teamId')
  updateTeam(@UserAuthInfo('uid') uid: string, @Param('teamId') teamId: string, @Body() updateTeamDto: UpdateTeamDto) {
    return this.teamService.updateTeam(uid, teamId, updateTeamDto);
  }

  @Delete('/:teamId')
  removeTeam(@UserAuthInfo('uid') uid: string, @Param('teamId') teamId: string) {
    return this.teamService.removeTeam(uid, teamId);
  }
}
