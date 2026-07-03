import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SearchListener } from './search.listener';
import { SearchProcessor } from './search.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'search-sync-queue',
    }),
  ],
  providers: [SearchListener, SearchProcessor],
})
export class SearchModule {}
