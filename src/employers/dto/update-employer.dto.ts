import { IsString, IsOptional, IsUrl, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEmployerDto {
  @ApiPropertyOptional({ example: 'Tech Corp Inc.', description: 'Company name' })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional({ example: 'A leading technology company.', description: 'Company description' })
  @IsString()
  @IsOptional()
  companyDescription?: string;

  @ApiPropertyOptional({ example: 'https://techcorp.com', description: 'Company website URL' })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ example: 'https://techcorp.com/logo.png', description: 'Company Logo URL' })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ example: '+628111112222', description: 'Company phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Jl. Jend. Sudirman Kav 1', description: 'Company physical address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 1, description: 'City ID' })
  @IsInt()
  @IsOptional()
  cityId?: number;

  @ApiPropertyOptional({ example: '51-200', description: 'Employee size range' })
  @IsString()
  @IsOptional()
  employeeSize?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID of the industry' })
  @IsInt()
  @IsOptional()
  industryId?: number;
}
