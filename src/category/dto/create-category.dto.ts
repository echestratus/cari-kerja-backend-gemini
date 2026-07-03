import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Software Engineering', description: 'The name of the category' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
