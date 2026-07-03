import { Controller, Get, Query } from '@nestjs/common';
import { CityService } from './city.service';

@Controller('cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Get()
  findAll(@Query('countryId') countryId?: string) {
    return this.cityService.findAll(countryId ? +countryId : undefined);
  }
}
