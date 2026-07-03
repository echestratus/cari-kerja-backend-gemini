import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ForbiddenException, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ResumeService } from './resume.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Resumes')
@Controller('resumes')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JOB_SEEKER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new resume (Job Seekers only)' })
  @ApiResponse({ status: 201, description: 'Resume created' })
  create(@Body() createResumeDto: CreateResumeDto, @CurrentUser() user: JwtPayload) {
    return this.resumeService.create(user.sub, createResumeDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JOB_SEEKER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all resumes for the current Job Seeker' })
  @ApiResponse({ status: 200, description: 'List of resumes' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.resumeService.findAll(user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific resume (Owner or Employer viewing application)' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.resumeService.findOne(id, user.sub, user.role);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JOB_SEEKER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a resume (Owner only)' })
  update(@Param('id') id: string, @Body() updateResumeDto: UpdateResumeDto, @CurrentUser() user: JwtPayload) {
    return this.resumeService.update(id, user.sub, updateResumeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JOB_SEEKER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a resume (Owner only)' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.resumeService.remove(id, user.sub);
  }

  // CV Upload
  @Post(':id/upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JOB_SEEKER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload CV file for a specific resume' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/CV',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(pdf|doc|docx)$/)) {
        return cb(new BadRequestException('Only PDF and DOC files are allowed!'), false);
      }
      cb(null, true);
    }
  }))
  async uploadCV(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @CurrentUser() user: JwtPayload) {
    if (!file) throw new BadRequestException('File is not provided');
    const fileUrl = `/uploads/CV/${file.filename}`;
    
    await this.resumeService.uploadCV(id, user.sub, fileUrl);

    return {
      fileUrl,
      message: 'CV uploaded successfully'
    };
  }
}
