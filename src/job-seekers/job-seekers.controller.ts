import { Controller, Get, Patch, Post, Put, Delete, Body, Param, UseGuards, BadRequestException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JobSeekersService } from './job-seekers.service';
import { UpdateJobSeekerDto } from './dto/update-job-seeker.dto';
import { CreateExperienceDto, UpdateExperienceDto } from './dto/experience.dto';
import { CreateEducationDto, UpdateEducationDto } from './dto/education.dto';
import { CreateCertificateDto, UpdateCertificateDto } from './dto/certificate.dto';
import { SyncSkillsDto } from './dto/sync-skills.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Job Seekers')
@Controller('job-seekers')
export class JobSeekersController {
  constructor(private readonly jobSeekersService: JobSeekersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get all job seekers (Employers/Admin only)' })
  @ApiResponse({ status: 200, description: 'Return all job seekers.' })
  findAll() {
    return this.jobSeekersService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Get job seeker profile by ID (Employers/Admin only)' })
  @ApiResponse({ status: 200, description: 'Return job seeker profile.' })
  findOne(@Param('id') id: string) {
    return this.jobSeekersService.findOne(id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JOB_SEEKER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Job Seeker profile details' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  updateJobSeekerProfile(
    @Body() updateDto: UpdateJobSeekerDto,
    @CurrentUser() user: JwtPayload
  ) {
    return this.jobSeekersService.updateJobSeekerProfile(user.sub, updateDto);
  }

  // Experience Endpoints
  @Post('experience')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JOB_SEEKER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add experience to profile' })
  addExperience(@Body() dto: CreateExperienceDto, @CurrentUser() user: JwtPayload) {
    return this.jobSeekersService.addExperience(user.sub, dto);
  }

  @Put('experience/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JOB_SEEKER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update experience' })
  updateExperience(@Param('id') id: string, @Body() dto: UpdateExperienceDto, @CurrentUser() user: JwtPayload) {
    return this.jobSeekersService.updateExperience(user.sub, id, dto);
  }

  @Delete('experience/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JOB_SEEKER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete experience' })
  deleteExperience(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.jobSeekersService.deleteExperience(user.sub, id);
  }

  // Education Endpoints
  @Post('education')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JOB_SEEKER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add education to profile' })
  addEducation(@Body() dto: CreateEducationDto, @CurrentUser() user: JwtPayload) {
    return this.jobSeekersService.addEducation(user.sub, dto);
  }

  @Put('education/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JOB_SEEKER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update education' })
  updateEducation(@Param('id') id: string, @Body() dto: UpdateEducationDto, @CurrentUser() user: JwtPayload) {
    return this.jobSeekersService.updateEducation(user.sub, id, dto);
  }

  @Delete('education/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JOB_SEEKER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete education' })
  deleteEducation(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.jobSeekersService.deleteEducation(user.sub, id);
  }

  // Certificate Endpoints
  @Post('certificate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JOB_SEEKER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add certificate to profile' })
  addCertificate(@Body() dto: CreateCertificateDto, @CurrentUser() user: JwtPayload) {
    return this.jobSeekersService.addCertificate(user.sub, dto);
  }

  @Put('certificate/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JOB_SEEKER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update certificate' })
  updateCertificate(@Param('id') id: string, @Body() dto: UpdateCertificateDto, @CurrentUser() user: JwtPayload) {
    return this.jobSeekersService.updateCertificate(user.sub, id, dto);
  }

  @Delete('certificate/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JOB_SEEKER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete certificate' })
  deleteCertificate(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.jobSeekersService.deleteCertificate(user.sub, id);
  }

  // Skills Sync
  @Patch('skills')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JOB_SEEKER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sync job seeker skills' })
  syncSkills(@Body() dto: SyncSkillsDto, @CurrentUser() user: JwtPayload) {
    return this.jobSeekersService.syncSkills(user.sub, dto);
  }

  // Avatar Upload
  @Post('avatar/upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JOB_SEEKER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload profile photo for job seeker' })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/avatars',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return cb(new BadRequestException('Only image files (jpg, jpeg, png) are allowed!'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  }))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: JwtPayload) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const fileUrl = `/uploads/avatars/${file.filename}`;
    await this.jobSeekersService.updateAvatar(user.sub, fileUrl);
    
    return {
      message: 'Avatar uploaded successfully',
      fileUrl
    };
  }
}
