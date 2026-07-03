import { IsOptional, IsString, IsInt, Min, IsEnum, IsIn, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { EmploymentType, VacancyStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetVacanciesDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search query for title and description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by city ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cityId?: number;

  @ApiPropertyOptional({ description: 'Filter by country ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  countryId?: number;

  @ApiPropertyOptional({ description: 'Filter by sub category IDs', isArray: true })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value.map(Number) : value.split(',').map(Number)))
  @IsInt({ each: true })
  subCategoryIds?: number[];

  @ApiPropertyOptional({ description: 'Filter by employment type', enum: EmploymentType, isArray: true })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',').map(v => v.trim())))
  @IsEnum(EmploymentType, { each: true })
  employmentType?: EmploymentType[];

  @ApiPropertyOptional({ description: 'Filter by job status', enum: VacancyStatus })
  @IsOptional()
  @IsEnum(VacancyStatus)
  status?: VacancyStatus;

  @ApiPropertyOptional({ description: 'Filter by premium status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPremium?: boolean;

  @ApiPropertyOptional({ description: 'Field to sort by', enum: ['createdAt', 'salary'], default: 'createdAt' })
  @IsOptional()
  @IsIn(['createdAt', 'salary'])
  sortBy?: 'createdAt' | 'salary' = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order: asc or desc', enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
