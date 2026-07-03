import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SavedJobService {
  constructor(private prisma: PrismaService) {}

  async saveJob(userId: string, vacancyId: string) {
    // find jobSeekerId
    const jobSeeker = await this.prisma.jobSeeker.findUnique({
      where: { userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Job Seeker profile not found');
    }

    // verify vacancy exists
    const vacancy = await this.prisma.jobVacancy.findUnique({
      where: { id: vacancyId },
    });

    if (!vacancy) {
      throw new NotFoundException('Job vacancy not found');
    }

    // Check if already saved
    const existing = await this.prisma.savedJob.findUnique({
      where: {
        unique_saved_job: {
          jobSeekerId: jobSeeker.id,
          vacancyId: vacancyId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Job already saved');
    }

    return this.prisma.savedJob.create({
      data: {
        jobSeekerId: jobSeeker.id,
        vacancyId: vacancyId,
      },
    });
  }

  async unsaveJob(userId: string, vacancyId: string) {
    const jobSeeker = await this.prisma.jobSeeker.findUnique({
      where: { userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Job Seeker profile not found');
    }

    const existing = await this.prisma.savedJob.findUnique({
      where: {
        unique_saved_job: {
          jobSeekerId: jobSeeker.id,
          vacancyId: vacancyId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Saved job not found');
    }

    return this.prisma.savedJob.delete({
      where: { id: existing.id },
    });
  }

  async getSavedJobs(userId: string) {
    const jobSeeker = await this.prisma.jobSeeker.findUnique({
      where: { userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Job Seeker profile not found');
    }

    return this.prisma.savedJob.findMany({
      where: { jobSeekerId: jobSeeker.id },
      include: {
        vacancy: {
          include: {
            employer: {
              select: { companyName: true, logoUrl: true },
            },
            subCategories: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
