import { Controller, Post, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { SavedJobService } from './saved-job.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('Saved Jobs')
@Controller('saved-jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.JOB_SEEKER)
@ApiBearerAuth()
export class SavedJobController {
  constructor(private readonly savedJobService: SavedJobService) {}

  @Post(':vacancyId')
  @ApiOperation({ summary: 'Save a job vacancy (Job Seekers only)' })
  @ApiParam({ name: 'vacancyId', type: 'string', description: 'ID of the Job Vacancy' })
  @ApiResponse({ status: 201, description: 'Job successfully saved' })
  @ApiResponse({ status: 409, description: 'Job already saved' })
  async saveJob(@Param('vacancyId') vacancyId: string, @CurrentUser() user: JwtPayload) {
    return this.savedJobService.saveJob(user.sub, vacancyId);
  }

  @Delete(':vacancyId')
  @ApiOperation({ summary: 'Unsave a job vacancy (Job Seekers only)' })
  @ApiParam({ name: 'vacancyId', type: 'string', description: 'ID of the Job Vacancy' })
  @ApiResponse({ status: 200, description: 'Job successfully unsaved' })
  async unsaveJob(@Param('vacancyId') vacancyId: string, @CurrentUser() user: JwtPayload) {
    return this.savedJobService.unsaveJob(user.sub, vacancyId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all saved jobs for current Job Seeker' })
  @ApiResponse({ status: 200, description: 'List of saved jobs with vacancy details' })
  async getSavedJobs(@CurrentUser() user: JwtPayload) {
    return this.savedJobService.getSavedJobs(user.sub);
  }
}
