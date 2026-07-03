import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { Meilisearch } from 'meilisearch';

@Processor('search-sync-queue')
export class SearchProcessor extends WorkerHost {
  private client: Meilisearch;

  constructor(private readonly prisma: PrismaService) {
    super();
    this.client = new Meilisearch({
      host: process.env.MEILI_HOST || 'http://localhost:7700',
      apiKey: process.env.MEILI_MASTER_KEY || 'masterKey123!',
    });
    
    // Ensure index exists and configure settings (e.g., filterableAttributes) asynchronously
    this.initializeMeiliSearch();
  }

  private async initializeMeiliSearch() {
    try {
      await this.client.index('vacancies').updateSettings({
        filterableAttributes: ['employmentType', 'status', 'isPremium', 'employerId'],
        sortableAttributes: ['createdAt', 'salaryMax'],
      });
    } catch (error) {
      console.error('Failed to initialize MeiliSearch settings:', error);
    }
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { vacancyId } = job.data;
    
    if (job.name === 'sync-vacancy') {
      const vacancy = await this.prisma.jobVacancy.findUnique({
        where: { id: vacancyId },
        include: {
          employer: {
            select: { companyName: true, logoUrl: true }
          },
          subCategories: {
            select: { id: true, name: true }
          }
        }
      });

      if (!vacancy) return; // Should not happen, but check anyway

      // Only sync ACTIVE and searchable vacancies, or sync all and use filterableAttributes
      // Let's just index everything and allow filtering on the frontend
      await this.client.index('vacancies').addDocuments([vacancy]);
    } 
    else if (job.name === 'delete-vacancy') {
      await this.client.index('vacancies').deleteDocument(vacancyId);
    }
  }
}
