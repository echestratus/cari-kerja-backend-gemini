import { IsString, IsNotEmpty, IsInt, IsOptional, IsNumber, IsBoolean, IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateResumeDto {
  @ApiProperty({ example: [1, 2], description: 'Array of SubCategory IDs (Max 3)' })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  subCategoryIds: number[];

  @ApiProperty({ example: 'Backend Developer', description: 'Job Title of the candidate' })
  @IsString()
  @IsNotEmpty()
  jobTitle: string;

  @ApiPropertyOptional({ example: 10000000, description: 'Expected Salary' })
  @IsOptional()
  @IsNumber()
  expectedSalary?: number;

  @ApiPropertyOptional({ example: true, description: 'Is the resume public to employers?', default: true })
  @IsOptional()
  @IsBoolean()
  isSearchable?: boolean;

  @ApiPropertyOptional({ example: 'Passionate Backend Engineer with 5+ years of experience', description: 'Professional summary' })
  @IsOptional()
  @IsString()
  professionalSummary?: string;

  @ApiPropertyOptional({ example: ['uuid-exp-1'], description: 'Array of Experience IDs to include' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  experienceIds?: string[];

  @ApiPropertyOptional({ example: ['uuid-edu-1'], description: 'Array of Education IDs to include' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  educationIds?: string[];

  @ApiPropertyOptional({ example: [1, 2, 3], description: 'Array of Skill IDs to include' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  skillIds?: number[];

  @ApiPropertyOptional({ example: ['uuid-cert-1'], description: 'Array of Certificate IDs to include' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certificateIds?: string[];
}
