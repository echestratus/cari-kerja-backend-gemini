import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, Min, IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { EmploymentType, VacancyStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVacancyDto {
  @ApiProperty({ example: [1, 2], description: 'Array of SubCategory IDs (Max 3)' })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  subCategoryIds: number[];

  @ApiProperty({ example: 'Senior Backend Engineer', description: 'Job Title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 1, description: 'Location ID referencing the lookup table' })
  @IsNumber()
  @IsNotEmpty()
  locationId: number;

  @ApiProperty({ example: 'We are looking for a Node.js expert...', description: 'Job Description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '3+ years of experience with NestJS and Prisma.', description: 'Job Requirements' })
  @IsString()
  @IsNotEmpty()
  requirements: string;

  @ApiPropertyOptional({ example: 8000000, description: 'Minimum Salary' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  salaryMin?: number;

  @ApiPropertyOptional({ example: 15000000, description: 'Maximum Salary' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  salaryMax?: number;

  @ApiProperty({ enum: EmploymentType, example: 'FULL_TIME', description: 'Employment Type' })
  @IsEnum(EmploymentType)
  @IsNotEmpty()
  employmentType: EmploymentType;

  @ApiPropertyOptional({ enum: VacancyStatus, example: 'PUBLISHED', description: 'Vacancy Status' })
  @IsOptional()
  @IsEnum(VacancyStatus)
  status?: VacancyStatus;
}
