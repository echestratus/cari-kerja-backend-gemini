import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { VacancyService } from './vacancy.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { GetVacanciesDto } from './dto/get-vacancies.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Vacancy Engine')
@Controller('vacancies')
export class VacancyController {
  constructor(private readonly vacancyService: VacancyService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new job vacancy (Employers only)' })
  @ApiResponse({ status: 201, description: 'Vacancy successfully created' })
  create(@Body() createVacancyDto: CreateVacancyDto, @CurrentUser() user: JwtPayload) {
    return this.vacancyService.create(user.sub, createVacancyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all job vacancies with pagination and filters' })
  @ApiResponse({ status: 200, description: 'List of vacancies with pagination metadata' })
  findAll(@Query() query: GetVacanciesDto) {
    return this.vacancyService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a job vacancy by ID' })
  @ApiResponse({ status: 200, description: 'Vacancy details' })
  findOne(@Param('id') id: string) {
    return this.vacancyService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a job vacancy (Owner Employer only)' })
  @ApiResponse({ status: 200, description: 'Vacancy successfully updated' })
  update(@Param('id') id: string, @Body() updateVacancyDto: UpdateVacancyDto, @CurrentUser() user: JwtPayload) {
    return this.vacancyService.update(id, user.sub, updateVacancyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a job vacancy (Owner Employer only)' })
  @ApiResponse({ status: 200, description: 'Vacancy successfully deleted' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.vacancyService.remove(id, user.sub);
  }
}
