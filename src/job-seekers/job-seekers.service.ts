import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateJobSeekerDto } from './dto/update-job-seeker.dto';
import { CreateExperienceDto, UpdateExperienceDto } from './dto/experience.dto';
import { CreateEducationDto, UpdateEducationDto } from './dto/education.dto';
import { CreateCertificateDto, UpdateCertificateDto } from './dto/certificate.dto';
import { SyncSkillsDto } from './dto/sync-skills.dto';

@Injectable()
export class JobSeekersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.jobSeeker.findMany({
      include: { city: { include: { country: true } }, user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    const seeker = await this.prisma.jobSeeker.findUnique({
      where: { id },
      include: { 
        city: { include: { country: true } }, 
        user: { select: { email: true } },
        resumes: {
          where: { isSearchable: true },
          include: { 
            subCategories: true,
            experiences: true,
            educations: true,
            skills: true,
            certificates: true
          }
        }
      }
    });
    if (!seeker) throw new NotFoundException('Job Seeker not found');
    return seeker;
  }

  async updateJobSeekerProfile(userId: string, updateDto: UpdateJobSeekerDto) {
    const seeker = await this.prisma.jobSeeker.findUnique({ where: { userId } });
    if (!seeker) throw new NotFoundException('Job seeker profile not found');

    return this.prisma.jobSeeker.update({
      where: { userId },
      data: updateDto,
      include: { city: { include: { country: true } } }
    });
  }

  async addExperience(userId: string, dto: CreateExperienceDto) {
    const seeker = await this.prisma.jobSeeker.findUnique({ where: { userId } });
    if (!seeker) throw new NotFoundException('Job seeker profile not found');
    const data: any = { ...dto, jobSeekerId: seeker.id };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    return this.prisma.experience.create({
      data
    });
  }

  async updateExperience(userId: string, expId: string, dto: UpdateExperienceDto) {
    const seeker = await this.prisma.jobSeeker.findUnique({ where: { userId } });
    if (!seeker) throw new NotFoundException('Job seeker profile not found');
    const exp = await this.prisma.experience.findFirst({ where: { id: expId, jobSeekerId: seeker.id }});
    if (!exp) throw new NotFoundException('Experience not found');
    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    return this.prisma.experience.update({
      where: { id: expId },
      data
    });
  }

  async deleteExperience(userId: string, expId: string) {
    const seeker = await this.prisma.jobSeeker.findUnique({ where: { userId } });
    if (!seeker) throw new NotFoundException('Job seeker profile not found');
    const exp = await this.prisma.experience.findFirst({ where: { id: expId, jobSeekerId: seeker.id }});
    if (!exp) throw new NotFoundException('Experience not found');
    await this.prisma.experience.delete({ where: { id: expId } });
    return { success: true };
  }

  async addEducation(userId: string, dto: CreateEducationDto) {
    const seeker = await this.prisma.jobSeeker.findUnique({ where: { userId } });
    if (!seeker) throw new NotFoundException('Job seeker profile not found');
    const data: any = { ...dto, jobSeekerId: seeker.id };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    return this.prisma.education.create({
      data
    });
  }

  async updateEducation(userId: string, eduId: string, dto: UpdateEducationDto) {
    const seeker = await this.prisma.jobSeeker.findUnique({ where: { userId } });
    if (!seeker) throw new NotFoundException('Job seeker profile not found');
    const edu = await this.prisma.education.findFirst({ where: { id: eduId, jobSeekerId: seeker.id }});
    if (!edu) throw new NotFoundException('Education not found');
    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    return this.prisma.education.update({
      where: { id: eduId },
      data
    });
  }

  async deleteEducation(userId: string, eduId: string) {
    const seeker = await this.prisma.jobSeeker.findUnique({ where: { userId } });
    if (!seeker) throw new NotFoundException('Job seeker profile not found');
    const edu = await this.prisma.education.findFirst({ where: { id: eduId, jobSeekerId: seeker.id }});
    if (!edu) throw new NotFoundException('Education not found');
    await this.prisma.education.delete({ where: { id: eduId } });
    return { success: true };
  }

  async addCertificate(userId: string, dto: CreateCertificateDto) {
    const seeker = await this.prisma.jobSeeker.findUnique({ where: { userId } });
    if (!seeker) throw new NotFoundException('Job seeker profile not found');
    const data: any = { ...dto, jobSeekerId: seeker.id };
    if (dto.issueDate) data.issueDate = new Date(dto.issueDate);
    if (dto.expirationDate) data.expirationDate = new Date(dto.expirationDate);
    return this.prisma.certificate.create({
      data
    });
  }

  async updateCertificate(userId: string, certId: string, dto: UpdateCertificateDto) {
    const seeker = await this.prisma.jobSeeker.findUnique({ where: { userId } });
    if (!seeker) throw new NotFoundException('Job seeker profile not found');
    const cert = await this.prisma.certificate.findFirst({ where: { id: certId, jobSeekerId: seeker.id }});
    if (!cert) throw new NotFoundException('Certificate not found');
    const data: any = { ...dto };
    if (dto.issueDate) data.issueDate = new Date(dto.issueDate);
    if (dto.expirationDate) data.expirationDate = new Date(dto.expirationDate);
    return this.prisma.certificate.update({
      where: { id: certId },
      data
    });
  }

  async deleteCertificate(userId: string, certId: string) {
    const seeker = await this.prisma.jobSeeker.findUnique({ where: { userId } });
    if (!seeker) throw new NotFoundException('Job seeker profile not found');
    const cert = await this.prisma.certificate.findFirst({ where: { id: certId, jobSeekerId: seeker.id }});
    if (!cert) throw new NotFoundException('Certificate not found');
    await this.prisma.certificate.delete({ where: { id: certId } });
    return { success: true };
  }

  async syncSkills(userId: string, dto: SyncSkillsDto) {
    const seeker = await this.prisma.jobSeeker.findUnique({ where: { userId } });
    if (!seeker) throw new NotFoundException('Job seeker profile not found');

    const skillIdsToConnect: number[] = [];

    for (const skillName of dto.skills) {
      const normalized = skillName.toLowerCase().trim().replace(/[\s\-]/g, '');
      if (!normalized) continue;
      
      let skill = await this.prisma.skill.findUnique({ where: { normalizedName: normalized } });
      if (!skill) {
        skill = await this.prisma.skill.create({
          data: { name: skillName.trim(), normalizedName: normalized }
        });
      }
      skillIdsToConnect.push(skill.id);
    }

    return this.prisma.jobSeeker.update({
      where: { id: seeker.id },
      data: {
        skills: {
          set: skillIdsToConnect.map(id => ({ id }))
        }
      },
      include: { skills: true }
    });
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const seeker = await this.prisma.jobSeeker.findUnique({ where: { userId } });
    if (!seeker) throw new NotFoundException('Job seeker profile not found');
    
    return this.prisma.jobSeeker.update({
      where: { userId },
      data: { avatarUrl }
    });
  }
}
