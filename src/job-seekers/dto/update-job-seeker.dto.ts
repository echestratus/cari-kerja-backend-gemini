import { IsString, IsOptional, IsUrl, IsEnum, IsBoolean, IsDateString, IsInt, Min } from 'class-validator';
import { Gender, MaritalStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateJobSeekerDto {
  @ApiPropertyOptional({ example: 'Budi Santoso', description: 'Full name' })
  @IsString()
  @IsOptional()
  fullName?: string;


  @ApiPropertyOptional({ example: 'I am a passionate software engineer...', description: 'Brief professional summary for the master profile' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ example: '081234567890', description: 'Phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg', description: 'Avatar URL' })
  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: '1995-08-15T00:00:00.000Z', description: 'Date of birth' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ enum: Gender, example: Gender.MALE, description: 'Gender' })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({ example: 'Jl. Sudirman No 1', description: 'Physical address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 1, description: 'City ID' })
  @IsInt()
  @IsOptional()
  cityId?: number;

  @ApiPropertyOptional({ example: 'https://myportfolio.com', description: 'Portfolio URL' })
  @IsUrl()
  @IsOptional()
  portfolioUrl?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/in/johndoe', description: 'LinkedIn URL' })
  @IsUrl()
  @IsOptional()
  linkedInUrl?: string;

  @ApiPropertyOptional({ example: true, description: 'Willing to relocate' })
  @IsBoolean()
  @IsOptional()
  willingToRelocate?: boolean;

  @ApiPropertyOptional({ enum: MaritalStatus, example: MaritalStatus.SINGLE, description: 'Marital status' })
  @IsEnum(MaritalStatus)
  @IsOptional()
  maritalStatus?: MaritalStatus;

  @ApiPropertyOptional({ example: '12.345.678.9-012.000', description: 'Tax ID / NPWP' })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiPropertyOptional({ example: 0, description: 'Number of dependents' })
  @IsInt()
  @Min(0)
  @IsOptional()
  dependents?: number;

  @ApiPropertyOptional({ example: 'Indonesian', description: 'Nationality' })
  @IsString()
  @IsOptional()
  nationality?: string;
}
