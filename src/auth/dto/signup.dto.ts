import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'Valid email address' })
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: 'StrongPassw0rd!', description: 'Password (min 8 characters)' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({ enum: UserRole, example: 'JOB_SEEKER', description: 'Role of the user registering' })
  @IsEnum(UserRole, { message: 'Role must be either JOB_SEEKER or EMPLOYER' })
  @IsNotEmpty({ message: 'Role is required' })
  role: UserRole;

  // --- Common Fields ---
  @ApiPropertyOptional({ example: '+1234567890', description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  // --- Job Seeker Specific Fields ---
  @ApiPropertyOptional({ example: 'John Doe', description: 'Full name (Required if role is JOB_SEEKER)' })
  @IsOptional()
  @IsString()
  fullName?: string;

  // --- Employer Specific Fields ---
  @ApiPropertyOptional({ example: 'Tech Corp Inc.', description: 'Company Name (Required if role is EMPLOYER)' })
  @IsOptional()
  @IsString()
  companyName?: string;
}
