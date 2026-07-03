import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEducationDto {
  @ApiPropertyOptional({ example: 'Bachelor of Computer Science' })
  @IsOptional()
  @IsString()
  degree?: string;

  @ApiProperty({ example: 'University of Indonesia' })
  @IsString()
  institutionName: string;

  @ApiPropertyOptional({ example: 'Computer Science' })
  @IsOptional()
  @IsString()
  fieldOfStudy?: string;

  @ApiProperty({ example: '2018-08-01T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: '2022-07-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 3.85 })
  @IsOptional()
  @IsNumber()
  gpa?: number;
}

export class UpdateEducationDto {
  @ApiPropertyOptional({ example: 'Bachelor of Computer Science' })
  @IsOptional()
  @IsString()
  degree?: string;

  @ApiPropertyOptional({ example: 'University of Indonesia' })
  @IsOptional()
  @IsString()
  institutionName?: string;

  @ApiPropertyOptional({ example: 'Computer Science' })
  @IsOptional()
  @IsString()
  fieldOfStudy?: string;

  @ApiPropertyOptional({ example: '2018-08-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2022-07-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 3.85 })
  @IsOptional()
  @IsNumber()
  gpa?: number;
}
