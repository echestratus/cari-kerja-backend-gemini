import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IndustryService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.industry.findMany({
      orderBy: { name: 'asc' }
    });
  }
}
