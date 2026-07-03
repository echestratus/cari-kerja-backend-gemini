import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { name: createCategoryDto.name }
    });
    
    if (existing) {
      throw new ConflictException('Category with this name already exists');
    }

    return this.prisma.category.create({
      data: createCategoryDto
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        subCategories: {
          orderBy: { name: 'asc' },
          include: {
            _count: {
              select: { jobVacancies: true }
            }
          }
        }
      }
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { subCategories: true }
    });
    
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id); // Ensure exists

    if (updateCategoryDto.name) {
      const existing = await this.prisma.category.findUnique({
        where: { name: updateCategoryDto.name }
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    // Note: Due to Restrict deletion policy on Vacancies/Resumes, this will fail 
    // if the category is in use. That's good standard DB behavior.
    return this.prisma.category.delete({
      where: { id }
    });
  }
}
