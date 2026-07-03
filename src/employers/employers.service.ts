import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UpdateEmployerDto } from './dto/update-employer.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class EmployersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.employer.findMany({
      where: { verificationStatus: 'APPROVED' },
      include: { location: true, industry: true, user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    const employer = await this.prisma.employer.findUnique({
      where: { id },
      include: { 
        location: true, 
        industry: true, 
        user: { select: { email: true } },
        jobVacancies: {
          where: { status: 'ACTIVE' },
          include: { location: true, subCategories: true }
        }
      }
    });
    if (!employer) throw new NotFoundException('Employer not found');
    return employer;
  }

  async updateEmployerProfile(userId: string, updateDto: UpdateEmployerDto) {
    const employer = await this.prisma.employer.findUnique({ where: { userId } });
    if (!employer) throw new NotFoundException('Employer profile not found');

    return this.prisma.employer.update({
      where: { userId },
      data: updateDto,
      include: { location: true, industry: true }
    });
  }
}
