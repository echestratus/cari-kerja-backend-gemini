import { Injectable, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Redis } from 'ioredis';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly CACHE_KEY = 'analytics:salary';
  private readonly CACHE_TTL = 12 * 60 * 60; // 12 hours in seconds

  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async getSalaryAnalytics() {
    // 1. Try to fetch from cache first
    const cachedData = await this.redis.get(this.CACHE_KEY);
    if (cachedData) {
      this.logger.debug('Returning salary analytics from Redis cache');
      return JSON.parse(cachedData);
    }

    // 2. If no cache, recalculate and cache
    this.logger.debug('Cache miss, calculating salary analytics from Database');
    const analyticsData = await this.calculateSalaryAnalytics();
    
    await this.redis.set(this.CACHE_KEY, JSON.stringify(analyticsData), 'EX', this.CACHE_TTL);
    return analyticsData;
  }

  // Cron job to run at midnight every day
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyCacheWarmup() {
    this.logger.log('Running scheduled salary analytics cache warmup');
    try {
      const analyticsData = await this.calculateSalaryAnalytics();
      await this.redis.set(this.CACHE_KEY, JSON.stringify(analyticsData), 'EX', this.CACHE_TTL);
      this.logger.log('Successfully warmed up salary analytics cache');
    } catch (error) {
      this.logger.error('Failed to warm up salary analytics cache', error);
    }
  }

  private async calculateSalaryAnalytics() {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Using Prisma aggregation for high performance calculation
    const result = await this.prisma.jobVacancy.groupBy({
      by: ['title'],
      where: {
        status: 'ACTIVE',
        createdAt: {
          gte: ninetyDaysAgo,
        },
        salaryMin: { not: null },
        salaryMax: { not: null },
      },
      _avg: {
        salaryMin: true,
        salaryMax: true,
      },
      _min: {
        salaryMin: true,
      },
      _max: {
        salaryMax: true,
      },
    });

    const formattedResult = result.map((row) => ({
      jobTitle: row.title,
      // Prisma returns Decimal object for Decimal fields, so we convert them safely to Number
      averageSalaryMin: row._avg.salaryMin ? Number(row._avg.salaryMin) : null,
      averageSalaryMax: row._avg.salaryMax ? Number(row._avg.salaryMax) : null,
      lowestSalary: row._min.salaryMin ? Number(row._min.salaryMin) : null,
      highestSalary: row._max.salaryMax ? Number(row._max.salaryMax) : null,
    }));

    return formattedResult;
  }
}
