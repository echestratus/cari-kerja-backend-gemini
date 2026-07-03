import { IsString, IsNotEmpty, IsOptional, IsDateString, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateCertificateDto {
  @ApiProperty({ example: 'AWS Certified Solutions Architect', description: 'Name of the certificate' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Amazon Web Services', description: 'Issuing organization' })
  @IsString()
  @IsNotEmpty()
  issuingOrganization: string;

  @ApiProperty({ example: '2023-01-15T00:00:00Z', description: 'Issue date (ISO 8601)' })
  @IsDateString()
  @IsNotEmpty()
  issueDate: string;

  @ApiPropertyOptional({ example: '2026-01-15T00:00:00Z', description: 'Expiration date (ISO 8601), if applicable' })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @ApiPropertyOptional({ example: 'AWS-123456', description: 'Credential ID' })
  @IsOptional()
  @IsString()
  credentialId?: string;

  @ApiPropertyOptional({ example: 'https://aws.amazon.com/verification', description: 'URL to verify the credential' })
  @IsOptional()
  @IsUrl()
  credentialUrl?: string;
}

export class UpdateCertificateDto extends PartialType(CreateCertificateDto) {}
