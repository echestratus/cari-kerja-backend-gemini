import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { EmployersService } from './employers.service';
import { UpdateEmployerDto } from './dto/update-employer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Employers')
@Controller('employers')
export class EmployersController {
  constructor(private readonly employersService: EmployersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all verified employers' })
  @ApiResponse({ status: 200, description: 'Return all verified employers.' })
  findAll() {
    return this.employersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employer profile by ID' })
  @ApiResponse({ status: 200, description: 'Return employer profile.' })
  findOne(@Param('id') id: string) {
    return this.employersService.findOne(id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Employer profile details' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  updateEmployerProfile(
    @Body() updateDto: UpdateEmployerDto,
    @CurrentUser() user: JwtPayload
  ) {
    return this.employersService.updateEmployerProfile(user.sub, updateDto);
  }
}
