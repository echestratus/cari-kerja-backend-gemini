import { Controller, Post, Body, Patch, Param, UseGuards, Get, Query } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplyDto } from './dto/apply.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { GetApplicationsDto } from './dto/get-applications.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('ATS Kanban')
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JOB_SEEKER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply to a job vacancy (Job Seekers only)' })
  @ApiResponse({ status: 201, description: 'Successfully applied to the vacancy' })
  apply(@Body() applyDto: ApplyDto, @CurrentUser() user: JwtPayload) {
    return this.applicationService.apply(user.sub, applyDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard) // Open to both roles (JOB_SEEKER and EMPLOYER), the service filters based on their ID/role
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all job applications with pagination and filters' })
  @ApiResponse({ status: 200, description: 'List of applications with pagination metadata' })
  findAll(@Query() query: GetApplicationsDto, @CurrentUser() user: JwtPayload) {
    return this.applicationService.findAll(user.sub, user.role, query);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update application status (Employers only)' })
  @ApiResponse({ status: 200, description: 'Application status successfully updated' })
  updateStatus(
    @Param('id') id: string, 
    @Body() updateStatusDto: UpdateStatusDto, 
    @CurrentUser() user: JwtPayload
  ) {
    return this.applicationService.updateStatus(id, user.sub, updateStatusDto);
  }

  @Patch(':id/withdraw')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JOB_SEEKER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Withdraw an application (Job Seekers only)' })
  @ApiResponse({ status: 200, description: 'Application successfully withdrawn' })
  withdraw(
    @Param('id') id: string, 
    @CurrentUser() user: JwtPayload
  ) {
    return this.applicationService.withdrawApplication(id, user.sub);
  }
}
