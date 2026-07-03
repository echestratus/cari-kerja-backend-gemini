import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplyDto {
  @ApiProperty({ example: 'vac-123-uuid', description: 'ID of the Vacancy' })
  @IsString()
  @IsNotEmpty()
  vacancyId: string;

  @ApiProperty({ example: 'res-456-uuid', description: 'ID of the Resume to apply with' })
  @IsString()
  @IsNotEmpty()
  resumeId: string;

  @ApiPropertyOptional({ example: 'I am highly interested in this role...', description: 'Optional cover letter' })
  @IsString()
  @IsOptional()
  coverLetter?: string;
  
  // Custom questionnaire answers for automatic screening
  @ApiPropertyOptional({ example: true, description: 'Does candidate meet all core requirements?' })
  @IsBoolean()
  @IsOptional()
  meetsAllRequirements?: boolean; 
}
