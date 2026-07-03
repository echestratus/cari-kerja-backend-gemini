import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IndustryService } from './industry.service';

@ApiTags('Industries')
@Controller('industries')
export class IndustryController {
  constructor(private readonly industryService: IndustryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all industries' })
  @ApiResponse({ status: 200, description: 'Return all industries.' })
  findAll() {
    return this.industryService.findAll();
  }
}
