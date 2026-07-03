import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) { }

  async findAll(q?: string) {
    if (q) {
      // Normalize by lowering case, removing spaces and hyphens, but keeping special chars like +, #, .
      const normalizedQ = q.toLowerCase().trim().replace(/[\s\-]/g, '');
      return this.prisma.skill.findMany({
        where: {
          normalizedName: {
            contains: normalizedQ
          }
        },
        take: 20
      });
    }

    return this.prisma.skill.findMany({
      take: 50,
      orderBy: { name: 'asc' }
    });
  }
}
