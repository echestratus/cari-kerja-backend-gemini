import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class ResumeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createResumeDto: CreateResumeDto) {
    const jobSeeker = await this.prisma.jobSeeker.findUnique({
      where: { userId }
    });

    if (!jobSeeker) throw new ForbiddenException('Only Job Seekers can create resumes');

    const { subCategoryIds, experienceIds, educationIds, skillIds, certificateIds, professionalSummary, ...rest } = createResumeDto;

    if (experienceIds?.length) {
      const count = await this.prisma.experience.count({ where: { id: { in: experienceIds }, jobSeekerId: jobSeeker.id } });
      if (count !== experienceIds.length) throw new ForbiddenException('Invalid experience IDs');
    }

    if (educationIds?.length) {
      const count = await this.prisma.education.count({ where: { id: { in: educationIds }, jobSeekerId: jobSeeker.id } });
      if (count !== educationIds.length) throw new ForbiddenException('Invalid education IDs');
    }

    if (certificateIds?.length) {
      const count = await this.prisma.certificate.count({ where: { id: { in: certificateIds }, jobSeekerId: jobSeeker.id } });
      if (count !== certificateIds.length) throw new ForbiddenException('Invalid certificate IDs');
    }

    return this.prisma.resume.create({
      data: {
        jobSeekerId: jobSeeker.id,
        professionalSummary,
        subCategories: {
          connect: subCategoryIds.map(id => ({ id }))
        },
        experiences: experienceIds?.length ? { connect: experienceIds.map(id => ({ id })) } : undefined,
        educations: educationIds?.length ? { connect: educationIds.map(id => ({ id })) } : undefined,
        skills: skillIds?.length ? { connect: skillIds.map(id => ({ id })) } : undefined,
        certificates: certificateIds?.length ? { connect: certificateIds.map(id => ({ id })) } : undefined,
        ...rest,
        isSearchable: rest.isSearchable ?? true,
      }
    });
  }

  async findAll(userId: string) {
    const jobSeeker = await this.prisma.jobSeeker.findUnique({
      where: { userId }
    });
    
    if (!jobSeeker) throw new ForbiddenException('Only Job Seekers can view their resumes list');

    return this.prisma.resume.findMany({
      where: { jobSeekerId: jobSeeker.id },
      include: { subCategories: true, experiences: true, educations: true, skills: true, certificates: true }
    });
  }

  async findOne(id: string, userId: string, role: string) {
    const resume = await this.prisma.resume.findUnique({
      where: { id },
      include: { 
        subCategories: true, 
        experiences: true, 
        educations: true, 
        skills: true, 
        certificates: true,
        jobSeeker: { select: { fullName: true, avatarUrl: true } } 
      }
    });

    if (!resume) throw new NotFoundException('Resume not found');

    if (role === UserRole.JOB_SEEKER) {
      const seeker = await this.prisma.jobSeeker.findUnique({ where: { userId } });
      if (resume.jobSeekerId !== seeker?.id) {
        throw new ForbiddenException('You can only view your own resumes');
      }
    } else if (role === UserRole.EMPLOYER) {
      const employer = await this.prisma.employer.findUnique({ where: { userId } });
      
      // Allow employer to view if the seeker applied to their vacancy with this resume
      const application = await this.prisma.application.findFirst({
        where: {
          resumeId: id,
          vacancy: { employerId: employer?.id }
        }
      });

      if (!application && !resume.isSearchable) {
        throw new ForbiddenException('You do not have permission to view this resume');
      }
    }

    return resume;
  }

  async update(id: string, userId: string, updateResumeDto: UpdateResumeDto) {
    const seeker = await this.prisma.jobSeeker.findUnique({ where: { userId } });
    if (!seeker) throw new ForbiddenException('Job seeker profile not found');

    const existing = await this.prisma.resume.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Resume not found');
    if (existing.jobSeekerId !== seeker.id) {
      throw new ForbiddenException('You can only update your own resumes');
    }

    const { subCategoryIds, experienceIds, educationIds, skillIds, certificateIds, professionalSummary, ...restUpdate } = updateResumeDto;
    const updateData: any = { ...restUpdate };
    
    if (professionalSummary !== undefined) {
      updateData.professionalSummary = professionalSummary;
    }

    if (subCategoryIds) {
      updateData.subCategories = {
        set: subCategoryIds.map(id => ({ id }))
      };
    }

    if (experienceIds) {
      const count = await this.prisma.experience.count({ where: { id: { in: experienceIds }, jobSeekerId: seeker.id } });
      if (count !== experienceIds.length) throw new ForbiddenException('Invalid experience IDs');
      updateData.experiences = { set: experienceIds.map(id => ({ id })) };
    }

    if (educationIds) {
      const count = await this.prisma.education.count({ where: { id: { in: educationIds }, jobSeekerId: seeker.id } });
      if (count !== educationIds.length) throw new ForbiddenException('Invalid education IDs');
      updateData.educations = { set: educationIds.map(id => ({ id })) };
    }

    if (skillIds) {
      updateData.skills = { set: skillIds.map(id => ({ id })) };
    }

    if (certificateIds) {
      const count = await this.prisma.certificate.count({ where: { id: { in: certificateIds }, jobSeekerId: seeker.id } });
      if (count !== certificateIds.length) throw new ForbiddenException('Invalid certificate IDs');
      updateData.certificates = { set: certificateIds.map(id => ({ id })) };
    }

    return this.prisma.resume.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, userId: string) {
    const seeker = await this.prisma.jobSeeker.findUnique({ where: { userId } });
    if (!seeker) throw new ForbiddenException('Job seeker profile not found');

    const existing = await this.prisma.resume.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Resume not found');
    if (existing.jobSeekerId !== seeker.id) {
      throw new ForbiddenException('You can only delete your own resumes');
    }

    await this.prisma.resume.delete({ where: { id } });
    return { message: 'Resume deleted successfully' };
  }

  async uploadCV(id: string, userId: string, fileUrl: string) {
    const seeker = await this.prisma.jobSeeker.findUnique({ where: { userId } });
    if (!seeker) throw new ForbiddenException('Job seeker profile not found');

    const existing = await this.prisma.resume.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Resume not found');
    if (existing.jobSeekerId !== seeker.id) {
      throw new ForbiddenException('You can only upload CVs for your own resumes');
    }

    return this.prisma.resume.update({
      where: { id },
      data: { fileUrl },
    });
  }
}
