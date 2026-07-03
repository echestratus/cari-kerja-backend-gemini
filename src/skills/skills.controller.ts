import { Controller, Get, Query } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all skills (for autocomplete)' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Search query for skill name' })
  findAll(@Query('q') q?: string) {
    return this.skillsService.findAll(q);
  }
}
