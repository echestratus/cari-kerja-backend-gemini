import { IsString, IsOptional, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExperienceDto {
  @ApiProperty({ example: 'Senior Software Engineer' })
  @IsString()
  jobTitle: string;

  @ApiProperty({ example: 'Tech Corp' })
  @IsString()
  companyName: string;

  @ApiProperty({ example: '2020-01-01T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: '2022-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isCurrentJob?: boolean;

  @ApiPropertyOptional({ example: 'Worked on microservices' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateExperienceDto {
  @ApiPropertyOptional({ example: 'Senior Software Engineer' })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional({ example: 'Tech Corp' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ example: '2020-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2022-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isCurrentJob?: boolean;

  @ApiPropertyOptional({ example: 'Worked on microservices' })
  @IsOptional()
  @IsString()
  description?: string;
}
