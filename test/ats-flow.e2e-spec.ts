import 'dotenv/config';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';
import { JwtService } from '@nestjs/jwt';
import { SearchProcessor } from '../src/search/search.processor';

describe('ATS Flow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);
    
    const searchQueue = app.get(getQueueToken('search-sync-queue'));
    jest.spyOn(searchQueue, 'add').mockResolvedValue(null as any);
    
    const mailQueue = app.get(getQueueToken('mail-queue'));
    jest.spyOn(mailQueue, 'add').mockResolvedValue(null as any);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should transition application status and write audit log', async () => {
    const ts = Date.now();
    // 1. Seed Employer
    const employerUser = await prisma.user.create({
      data: {
        email: `employer_ats_${ts}@test.com`,
        passwordHash: 'hash',
        role: 'EMPLOYER',
        employer: {
          create: { companyName: 'Corp ATS', verificationStatus: 'APPROVED' }
        }
      },
      include: { employer: true }
    });

    // 2. Seed Job Seeker
    const seekerUser = await prisma.user.create({
      data: {
        email: `seeker_ats_${ts}@test.com`,
        passwordHash: 'hash',
        role: 'JOB_SEEKER',
        jobSeeker: {
          create: { fullName: 'John ATS' }
        }
      },
      include: { jobSeeker: true }
    });

    const category = await prisma.category.create({ data: { name: `ATS_Cat_${ts}` } });
    const subCategory = await prisma.subCategory.create({ data: { name: `ATS_Sub_${ts}`, categoryId: category.id } });
    const loc = await prisma.location.create({ data: { city: `City_${ts}`, country: 'ID' } });

    // 3. Seed Vacancy & Resume
    const vacancy = await prisma.jobVacancy.create({
      data: {
        employerId: employerUser.employer!.id,
        subCategories: { connect: [{ id: subCategory.id }] },
        title: 'ATS Dev',
        locationId: loc.id,
        description: 'desc',
        requirements: 'req',
        employmentType: 'FULL_TIME',
        status: 'ACTIVE'
      }
    });

    const resume = await prisma.resume.create({
      data: {
        jobSeekerId: seekerUser.jobSeeker!.id,
        subCategories: { connect: [{ id: subCategory.id }] },
        jobTitle: 'Software Eng',
      }
    });

    // 4. Seed Application
    const application = await prisma.application.create({
      data: {
        vacancyId: vacancy.id,
        resumeId: resume.id,
        status: 'APPLIED'
      }
    });

    // 5. Act: Update Status as Employer
    const employerToken = jwtService.sign({ sub: employerUser.id, role: employerUser.role }, { secret: process.env.JWT_SECRET || 'test-secret' });
    
    const response = await request(app.getHttpServer())
      .patch(`/applications/${application.id}/status`)
      .set('Authorization', `Bearer ${employerToken}`)
      .send({ status: 'INTERVIEW' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('INTERVIEW');

    // 6. Assert Audit Trail in DB
    const logs = await prisma.applicationLog.findMany({
      where: { applicationId: application.id }
    });

    expect(logs.length).toBe(1);
    expect(logs[0].newStatus).toBe('INTERVIEW');
    expect(logs[0].oldStatus).toBe('APPLIED');
    expect(logs[0].changedBy).toBe('EMPLOYER');

    // Cleanup
    await prisma.user.deleteMany({
      where: { id: { in: [employerUser.id, seekerUser.id] } }
    });
    await prisma.category.delete({ where: { id: category.id } });
    await prisma.location.delete({ where: { id: loc.id } });
  });
});
