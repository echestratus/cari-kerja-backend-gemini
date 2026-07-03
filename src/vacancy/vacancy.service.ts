import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GetVacanciesDto } from './dto/get-vacancies.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class VacancyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, createVacancyDto: CreateVacancyDto) {
    const employer = await this.prisma.employer.findUnique({
      where: { userId },
    });

    if (!employer) {
      throw new ForbiddenException('Only employers can create vacancies.');
    }

    if (employer.verificationStatus !== 'APPROVED') {
      throw new ForbiddenException('Employer account must be verified to post jobs.');
    }

    const { subCategoryIds, ...restDto } = createVacancyDto;
    const vacancy = await this.prisma.$transaction(async (tx) => {
      return tx.jobVacancy.create({
        data: {
          ...restDto,
          employerId: employer.id,
          subCategories: {
            connect: subCategoryIds.map(id => ({ id }))
          }
        },
      });
    });

    this.eventEmitter.emit('vacancy.created', { vacancyId: vacancy.id });
    return vacancy;
  }

  async findAll(query: GetVacanciesDto) {
    const { page = 1, limit = 10, search, locationId, subCategoryIds, employmentType, status, isPremium, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.JobVacancyWhereInput = {};

    if (status) {
      where.status = status;
    } else {
      where.status = 'ACTIVE';
    }

    if (subCategoryIds && subCategoryIds.length > 0) {
      where.subCategories = {
        some: {
          id: { in: subCategoryIds }
        }
      };
    }

    if (query.locationId) {
      where.locationId = query.locationId;
    }

    if (employmentType && employmentType.length > 0) {
      where.employmentType = { in: employmentType };
    }

    if (isPremium !== undefined) {
      where.isPremium = isPremium;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { city: { contains: search, mode: 'insensitive' } } },
        { location: { country: { contains: search, mode: 'insensitive' } } },
        { employer: { companyName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    let orderBy: Prisma.JobVacancyOrderByWithRelationInput = { createdAt: sortOrder };
    if (sortBy === 'salary') {
      orderBy = { salaryMax: sortOrder }; // Using salaryMax as the primary salary indicator
    }

    const [data, total] = await Promise.all([
      this.prisma.jobVacancy.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          employer: {
            select: { companyName: true, logoUrl: true }
          },
          subCategories: {
            select: { id: true, name: true, categoryId: true }
          },
          location: true
        }
      }),
      this.prisma.jobVacancy.count({ where })
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

  async findOne(id: string) {
    const vacancy = await this.prisma.jobVacancy.findUnique({
      where: { id },
      include: { employer: true, subCategories: true, location: true }
    });

    if (!vacancy) throw new NotFoundException('Vacancy not found');
    return vacancy;
  }

  async update(id: string, userId: string, updateVacancyDto: UpdateVacancyDto) {
    const employer = await this.prisma.employer.findUnique({ where: { userId } });
    if (!employer) throw new ForbiddenException('Only employers can update vacancies.');

    const existing = await this.prisma.jobVacancy.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Vacancy not found');

    if (existing.employerId !== employer.id) {
      throw new ForbiddenException('You can only update your own vacancies');
    }

    const { subCategoryIds, ...restUpdate } = updateVacancyDto;
    const updateData: Prisma.JobVacancyUpdateInput = { ...restUpdate };
    
    if (subCategoryIds) {
      updateData.subCategories = {
        set: subCategoryIds.map(id => ({ id }))
      };
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      return tx.jobVacancy.update({
        where: { id },
        data: updateData,
      });
    });

    this.eventEmitter.emit('vacancy.updated', { vacancyId: updated.id });
    return updated;
  }

  async remove(id: string, userId: string) {
    const employer = await this.prisma.employer.findUnique({ where: { userId } });
    if (!employer) throw new ForbiddenException('Only employers can delete vacancies.');

    const existing = await this.prisma.jobVacancy.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Vacancy not found');

    if (existing.employerId !== employer.id) {
      throw new ForbiddenException('You can only delete your own vacancies');
    }

    await this.prisma.jobVacancy.delete({ where: { id } });
    this.eventEmitter.emit('vacancy.deleted', { vacancyId: id });
    return { message: 'Vacancy deleted successfully' };
  }
}
