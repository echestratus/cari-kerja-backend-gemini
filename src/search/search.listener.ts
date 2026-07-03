import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class SearchListener {
  constructor(@InjectQueue('search-sync-queue') private searchSyncQueue: Queue) {}

  @OnEvent('vacancy.created')
  async handleVacancyCreatedEvent(payload: { vacancyId: string }) {
    await this.searchSyncQueue.add('sync-vacancy', payload);
  }

  @OnEvent('vacancy.updated')
  async handleVacancyUpdatedEvent(payload: { vacancyId: string }) {
    await this.searchSyncQueue.add('sync-vacancy', payload);
  }

  @OnEvent('vacancy.deleted')
  async handleVacancyDeletedEvent(payload: { vacancyId: string }) {
    await this.searchSyncQueue.add('delete-vacancy', payload);
  }
}
