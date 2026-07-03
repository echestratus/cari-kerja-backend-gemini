import { Module } from '@nestjs/common';
import { JobSeekersController } from './job-seekers.controller';
import { JobSeekersService } from './job-seekers.service';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [JobSeekersController],
  providers: [JobSeekersService]
})
export class JobSeekersModule {}
