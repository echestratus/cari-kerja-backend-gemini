import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyDto } from './dto/apply.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UserRole, ApplicationStatus, Prisma } from '@prisma/client';
import { GetApplicationsDto } from './dto/get-applications.dto';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('mail-queue') private mailQueue: Queue,
  ) {}

  async apply(userId: string, applyDto: ApplyDto) {
    const jobSeeker = await this.prisma.jobSeeker.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!jobSeeker) {
      throw new ForbiddenException('Only job seekers can apply for vacancies.');
    }

    const vacancy = await this.prisma.jobVacancy.findUnique({
      where: { id: applyDto.vacancyId }
    });

    if (!vacancy) {
      throw new NotFoundException('Vacancy not found');
    }

    // Database Constraint Check: Prevent duplicate application for the same vacancy and resume
    const existing = await this.prisma.application.findUnique({
      where: {
        unique_vacancy_resume: {
          vacancyId: applyDto.vacancyId,
          resumeId: applyDto.resumeId,
        }
      }
    });

    if (existing) {
      throw new ConflictException('You have already applied to this vacancy with this resume.');
    }

    // Process Application
    const application = await this.prisma.$transaction(async (tx) => {
      const app = await tx.application.create({
        data: {
          vacancyId: applyDto.vacancyId,
          resumeId: applyDto.resumeId,
          coverLetter: applyDto.coverLetter,
          status: 'APPLIED',
        },
      });

      // Audit trail creation
      await tx.applicationLog.create({
        data: {
          applicationId: app.id,
          newStatus: 'APPLIED',
          changedBy: UserRole.JOB_SEEKER,
        }
      });

      return app;
    });

    // Advanced Screening Evaluator
    // If candidate indicates they do not meet requirements in the custom questionnaire,
    // we use a delayed job to send a polite rejection exactly 48 hours later.
    if (applyDto.meetsAllRequirements === false) {
      await this.mailQueue.add(
        'rejection-email',
        {
          email: jobSeeker.user.email,
          seekerName: jobSeeker.fullName,
          vacancyTitle: vacancy.title,
        },
        { delay: 48 * 60 * 60 * 1000 } // 48 hours in ms
      );
    }

    return application;
  }

  async findAll(userId: string, role: string, query: GetApplicationsDto) {
    const { page = 1, limit = 10, search, vacancyId, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ApplicationWhereInput = {};

    if (role === UserRole.JOB_SEEKER) {
      const seeker = await this.prisma.jobSeeker.findUnique({ where: { userId } });
      if (!seeker) throw new ForbiddenException('Job seeker profile not found');
      
      // Job seekers can only see their own applications
      where.resume = { jobSeekerId: seeker.id };
    } else if (role === UserRole.EMPLOYER) {
      const employer = await this.prisma.employer.findUnique({ where: { userId } });
      if (!employer) throw new ForbiddenException('Employer profile not found');

      // Employers can only see applications for their own vacancies
      where.vacancy = { employerId: employer.id };
    }

    if (vacancyId) {
      // If it's an employer, we already scoped the vacancy down to their own. 
      // It's safe to just add this condition.
      where.vacancyId = vacancyId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      // Search across coverLetter and the vacancy title
      where.OR = [
        { coverLetter: { contains: search, mode: 'insensitive' } },
        { vacancy: { title: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          vacancy: {
            select: { title: true, employer: { select: { companyName: true, logoUrl: true } } }
          },
          resume: {
            select: { id: true, jobSeeker: { select: { fullName: true, avatarUrl: true } } }
          }
        }
      }),
      this.prisma.application.count({ where })
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      }
    };
  }

  async updateStatus(id: string, userId: string, updateStatusDto: UpdateStatusDto) {
    const employer = await this.prisma.employer.findUnique({ where: { userId } });
    if (!employer) throw new ForbiddenException('Only employers can update statuses.');

    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { vacancy: true }
    });

    if (!application) throw new NotFoundException('Application not found');

    if (application.vacancy.employerId !== employer.id) {
      throw new ForbiddenException('You can only update applications for your own vacancies');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id },
        data: { status: updateStatusDto.status }
      });

      // Automated Audit Trail for ATS
      await tx.applicationLog.create({
        data: {
          applicationId: app.id,
          oldStatus: application.status,
          newStatus: updateStatusDto.status,
          changedBy: UserRole.EMPLOYER,
        }
      });

      return app;
    });

    return updated;
  }

  async withdrawApplication(id: string, userId: string) {
    const seeker = await this.prisma.jobSeeker.findUnique({ where: { userId } });
    if (!seeker) throw new ForbiddenException('Only job seekers can withdraw applications.');

    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { resume: true }
    });

    if (!application) throw new NotFoundException('Application not found');

    if (application.resume.jobSeekerId !== seeker.id) {
      throw new ForbiddenException('You can only withdraw your own applications');
    }

    if (['HIRED', 'REJECTED', 'WITHDRAWN'].includes(application.status)) {
      throw new ConflictException(`Cannot withdraw an application that is already ${application.status}`);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id },
        data: { status: 'WITHDRAWN' }
      });

      // Automated Audit Trail
      await tx.applicationLog.create({
        data: {
          applicationId: app.id,
          oldStatus: application.status,
          newStatus: 'WITHDRAWN',
          changedBy: UserRole.JOB_SEEKER,
        }
      });

      return app;
    });

    return updated;
  }
}
