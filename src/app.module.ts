import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { VacancyModule } from './vacancy/vacancy.module';
import { SearchModule } from './search/search.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';
import { MailModule } from './mail/mail.module';
import { ApplicationModule } from './application/application.module';
import { BillingModule } from './billing/billing.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CategoryModule } from './category/category.module';
import { ResumeModule } from './resume/resume.module';
import { SavedJobModule } from './saved-job/saved-job.module';

import { IndustryModule } from './industry/industry.module';
import { EmployersModule } from './employers/employers.module';
import { JobSeekersModule } from './job-seekers/job-seekers.module';
import { SkillsModule } from './skills/skills.module';
import { CountryModule } from './country/country.module';
import { CityModule } from './city/city.module';

@Module({
  imports: [
    PrismaModule, 
    UsersModule, 
    AuthModule,
    VacancyModule,
    SearchModule,
    MailModule,
    ApplicationModule,
    BillingModule,
    AnalyticsModule,
    CategoryModule,
    ResumeModule,
    ScheduleModule.forRoot(),


    EventEmitterModule.forRoot(),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    SavedJobModule,
    IndustryModule,
    EmployersModule,
    JobSeekersModule,
    SkillsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    CountryModule,
    CityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
