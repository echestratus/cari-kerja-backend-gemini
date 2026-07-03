import { Controller, Get } from '@nestjs/common';
import { LocationService } from './location.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Locations Lookup')
@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all locations for dropdown menus' })
  @ApiResponse({ status: 200, description: 'List of all cities and countries' })
  findAll() {
    return this.locationService.findAll();
  }
}
