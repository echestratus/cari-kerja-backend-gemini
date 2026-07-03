import { Module } from '@nestjs/common';
import { SavedJobService } from './saved-job.service';
import { SavedJobController } from './saved-job.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SavedJobController],
  providers: [SavedJobService],
})
export class SavedJobModule {}
