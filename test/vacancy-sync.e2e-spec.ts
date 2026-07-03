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

describe('Vacancy Sync Flow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let mockQueueAdd: jest.SpyInstance;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);
    
    const searchQueue = app.get(getQueueToken('search-sync-queue'));
    mockQueueAdd = jest.spyOn(searchQueue, 'add').mockResolvedValue(null as any);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a vacancy, save to DB, and push to search-sync-queue', async () => {
    // 1. Setup Test Data (Employer User)
    const user = await prisma.user.create({
      data: {
        email: `employer_${Date.now()}@test.com`,
        passwordHash: 'hashed_password',
        role: 'EMPLOYER',
        isVerified: true,
        employer: {
          create: {
            companyName: 'Test Corp',
            verificationStatus: 'APPROVED'
          }
        }
      },
      include: { employer: true }
    });

    const category = await prisma.category.create({
      data: { name: `IT_${Date.now()}` }
    });
    
    const subCategory = await prisma.subCategory.create({
      data: { name: `Software_${Date.now()}`, categoryId: category.id }
    });

    const location = await prisma.location.create({
      data: { city: `City_${Date.now()}`, country: 'ID' }
    });

    // 2. Generate Access Token
    const token = jwtService.sign({ sub: user.id, role: user.role }, { secret: process.env.JWT_SECRET || 'test-secret' });

    // 3. Act: Create Vacancy via HTTP
    const vacancyData = {
      subCategoryIds: [subCategory.id],
      locationId: location.id,
      title: 'Senior NestJS Developer',
      description: 'We need a good dev',
      requirements: 'TypeScript, Postgres',
      salaryMin: 10000,
      salaryMax: 20000,
      employmentType: 'FULL_TIME'
    };

    const response = await request(app.getHttpServer())
      .post('/vacancies')
      .set('Authorization', `Bearer ${token}`)
      .send(vacancyData);

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();

    const createdVacancyId = response.body.id;

    // 4. Assert DB state
    const vacancyInDb = await prisma.jobVacancy.findUnique({
      where: { id: createdVacancyId }
    });
    expect(vacancyInDb).toBeDefined();
    expect(vacancyInDb!.title).toBe('Senior NestJS Developer');

    // 5. Wait slightly for Event Emitter (it is sync/async but let's allow a small tick)
    await new Promise(resolve => setTimeout(resolve, 100));

    // 6. Assert BullMQ was called by the listener
    expect(mockQueueAdd).toHaveBeenCalledWith('sync-vacancy', {
      vacancyId: createdVacancyId
    });

    // Cleanup
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.category.delete({ where: { id: category.id } });
    await prisma.location.delete({ where: { id: location.id } });
  });
});
