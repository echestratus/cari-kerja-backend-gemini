import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async getFullProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
        jobSeeker: {
          select: { 
            fullName: true, phone: true, avatarUrl: true, address: true, city: { include: { country: true } },
            dateOfBirth: true, gender: true, portfolioUrl: true, linkedInUrl: true,
            willingToRelocate: true, maritalStatus: true, taxId: true, dependents: true,
            nationality: true,
            skills: true,
            experiences: true,
            educations: true,
            certificates: true,
            resumes: {
              include: { subCategories: true }
            }
          }
        },
        employer: {
          select: { companyName: true, companyDescription: true, website: true, logoUrl: true, phone: true, address: true, city: { include: { country: true } }, employeeSize: true, industry: true, verificationStatus: true, jobPostingQuota: true, resumeViewQuota: true }
        }
      }
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

}
