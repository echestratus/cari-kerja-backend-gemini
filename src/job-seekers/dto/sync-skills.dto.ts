import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SyncSkillsDto {
  @ApiProperty({ example: ['ReactJS', 'Node.js', 'Typescript'], description: 'Array of skill names' })
  @IsArray()
  @IsString({ each: true })
  skills: string[];
}
