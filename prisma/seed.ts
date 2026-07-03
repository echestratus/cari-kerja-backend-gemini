import 'dotenv/config';
import { PrismaClient, EmploymentType, VacancyStatus, Employer, JobSeeker, Gender, MaritalStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Cleaning up existing data...');
  await prisma.applicationLog.deleteMany();
  await prisma.application.deleteMany();
  await prisma.jobVacancy.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.subCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.industry.deleteMany();
  await prisma.category.deleteMany();
  await prisma.location.deleteMany();
  await prisma.education.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.jobSeeker.deleteMany();
  await prisma.employer.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding database with expanded dummy data...');
  
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Categories & SubCategories
  const categoryData = [
    {
      name: 'Technology, Data & IT',
      subCategories: ['Software Engineering & Web Development', 'Data Science, Analytics & Big Data', 'IT Infrastructure, Network & Systems', 'Cybersecurity & Information Security', 'Product Management', 'UI/UX & Product Design', 'Cloud Computing & DevOps', 'Artificial Intelligence (AI) & Machine Learning', 'Blockchain & Web3 Engineering', 'Database Administration']
    },
    {
      name: 'Business, Management & Finance',
      subCategories: ['Finance, Accounting & Tax', 'Sales & Business Development', 'Marketing, Branding & Growth', 'Human Resources (HR) & Talent Acquisition', 'Operations & General Affairs (GA)', 'Management Consulting & Strategy', 'Procurement, Purchasing & Sourcing', 'Project & Program Management', 'Risk Management, Audit & Compliance', 'Investment Banking & Wealth Management', 'Insurance & Actuarial']
    },
    {
      name: 'Creative, Media & Communications',
      subCategories: ['Graphic Design, Illustration & Visual Arts', 'Content Writing, Editorial & Journalism', 'Public Relations (PR) & Corporate Communications', 'Video Production, Photography & Animation', 'Audio Production, Podcast & Music', 'Broadcasting, Radio & Television', 'Advertising & Copywriting', 'Social Media Management & Content Creation', 'Entertainment & Performing Arts', 'Fashion & Apparel Design']
    },
    {
      name: 'Customer Service & Administration',
      subCategories: ['Customer Support & Customer Success', 'Administrative, Secretarial & Office Support', 'Call Center & Telemarketing', 'Virtual Assistant & Remote Support', 'Data Entry & Transcription']
    },
    {
      name: 'Healthcare & Wellness',
      subCategories: ['Medical Practitioners', 'Nursing & Midwifery', 'Pharmacy & Pharmaceutical Sciences', 'Biotechnology & Life Sciences R&D', 'Psychology, Therapy & Mental Health', 'Fitness, Wellness & Nutrition', 'Dentistry', 'Veterinary Medicine', 'Healthcare Administration & Management']
    },
    {
      name: 'Education, Research & Science',
      subCategories: ['Education, Teaching & Tutoring', 'Academic Research & Development (R&D)', 'Institutional Training & Corporate Learning', 'Library & Museum Information Management', 'Linguistic & Translation Services']
    },
    {
      name: 'Legal, Government & Social Services',
      subCategories: ['Legal Services, Judiciary & Corporate Legal', 'Government, Public Policy & Diplomacy', 'Non-Profit (NGO), Social Services & Activism', 'Security, Defense & Military', 'Firefighting & Emergency Response', 'Urban Planning & Community Development']
    },
    {
      name: 'Engineering, Manufacturing & Construction',
      subCategories: ['Civil Engineering & Construction Management', 'Mechanical & Electrical Engineering', 'Manufacturing, Factory & Production Operations', 'Architecture & Interior Design', 'Chemical & Materials Engineering', 'Aerospace, Aviation & Marine Engineering', 'Quality Assurance (QA) & Quality Control (QC) Industrial', 'Automation & Robotics Engineering']
    },
    {
      name: 'Logistics, Transportation & Retail',
      subCategories: ['Logistics, Supply Chain & Warehousing', 'Automotive Services & Repair', 'Shipping, Freight & Maritime Operations', 'Aviation, Pilot & Flight Operations', 'Retail, Store Operations & Merchandising', 'E-commerce Operations & Management', 'Real Estate, Property Management & Appraisal']
    },
    {
      name: 'Services, Hospitality & Tourism',
      subCategories: ['Hospitality, Hotel & Resort Management', 'Food & Beverage (F&B), Culinary & Chef', 'Travel, Tourism & Tour Guide', 'Beauty, Salon & Personal Care', 'Facilities Management, Cleaning & Maintenance', 'Event Planning & Wedding Organizing']
    },
    {
      name: 'Agriculture, Energy & Environment',
      subCategories: ['Agriculture, Farming & Agronomy', 'Forestry & Wildlife Conservation', 'Mining, Oil, Gas & Petroleum Engineering', 'Renewable Energy & Utilities', 'Environmental Science & Sustainability', 'Fisheries, Aquaculture & Marine Biology']
    }
  ];

  const subCategories: any[] = [];
  for (const cat of categoryData) {
    const createdCat = await prisma.category.create({ data: { name: cat.name } });
    for (const subName of cat.subCategories) {
      const sub = await prisma.subCategory.create({
        data: { name: subName, categoryId: createdCat.id }
      });
      subCategories.push(sub);
    }
  }
  console.log(`Created categories and ${subCategories.length} subcategories`);

  // 1b. Locations
  const cityNames = ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Medan', 'Bali', 'Semarang', 'Makassar'];
  const locations = await Promise.all(
    cityNames.map(city => prisma.location.create({ data: { city, country: 'Indonesia' } }))
  );
  console.log(`Created ${locations.length} locations`);

  // 1c. Industries
  const industryNames = [
    'Information Technology & Services',
    'Financial Services',
    'Healthcare & Medical',
    'Manufacturing',
    'Retail',
    'Education',
    'Real Estate',
    'Telecommunications',
    'Transportation & Logistics',
    'Hospitality & Tourism'
  ];
  const industries = await Promise.all(
    industryNames.map(name => prisma.industry.create({ data: { name } }))
  );
  console.log(`Created ${industries.length} industries`);

  // 1d. Skills
  const initialSkills = [
    'JavaScript', 'TypeScript', 'Node.js', 'React.js', 'Vue.js', 'Angular', 'Python', 'Django',
    'Java', 'Spring Boot', 'C#', '.NET', 'Go', 'Rust', 'PHP', 'Laravel', 'Ruby', 'Ruby on Rails',
    'C++', 'Swift', 'Kotlin', 'Flutter', 'React Native', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB',
    'Redis', 'GraphQL', 'REST API', 'Docker', 'Kubernetes', 'AWS', 'Google Cloud', 'Azure',
    'CI/CD', 'Git', 'Linux', 'Machine Learning', 'Data Science', 'Data Analysis', 'Tableau',
    'Power BI', 'Figma', 'UI/UX Design', 'Adobe Photoshop', 'Adobe Illustrator', 'SEO',
    'Digital Marketing', 'Content Writing', 'Project Management', 'Agile', 'Scrum', 'Sales',
    'Customer Service', 'Accounting', 'Financial Analysis', 'Human Resources', 'Recruitment'
  ];
  
  const skillsData = initialSkills.map(name => ({
    name,
    normalizedName: name.toLowerCase().trim().replace(/[\s\-]/g, '')
  }));

  await prisma.skill.createMany({ data: skillsData, skipDuplicates: true });
  const allSkills = await prisma.skill.findMany();
  console.log(`Created ${allSkills.length} skills`);

  // 2. Employers (10 Companies)
  const employeeSizes = ['1-50', '51-200', '201-500', '501-1000', '1000+'];
  const employers: Employer[] = [];
  for (let i = 1; i <= 10; i++) {
    const companyName = `Company ${String.fromCharCode(64 + i)} Tech`;
    const user = await prisma.user.create({
      data: {
        email: `employer${i}@test.com`,
        passwordHash,
        role: 'EMPLOYER',
        isVerified: i <= 8, // 8 verified, 2 pending
        employer: {
          create: {
            companyName,
            companyDescription: `We are ${companyName}, a leading tech company specializing in innovative solutions.`,
            website: `https://company${i}.com`,
            logoUrl: `https://ui-avatars.com/api/?name=${companyName.replace(/ /g, '+')}&background=0D8ABC&color=fff&size=256`,
            phone: `+6281100000${i < 10 ? '0' + i : i}`,
            address: `Jl. Jend. Sudirman Kav. ${i}, Tower ${i}`,
            locationId: locations[i % locations.length].id,
            employeeSize: employeeSizes[i % employeeSizes.length],
            industryId: industries[i % industries.length].id,
            verificationStatus: i <= 8 ? 'APPROVED' : 'PENDING',
            jobPostingQuota: 50,
            resumeViewQuota: 100
          }
        }
      },
      include: { employer: true }
    });
    employers.push(user.employer!);
  }
  console.log(`Created 10 employers`);

  // 3. Job Seekers (20 Seekers)
  const jobSeekers: JobSeeker[] = [];
  for (let i = 1; i <= 20; i++) {
    const fullName = `Candidate ${i} ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][i % 5]}`;
    const user = await prisma.user.create({
      data: {
        email: `seeker${i}@test.com`,
        passwordHash,
        role: 'JOB_SEEKER',
        isVerified: true,
        jobSeeker: {
          create: { 
            fullName,
            phone: `+62812000000${i < 10 ? '0'+i : i}`,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=Seeker${i}&backgroundColor=b6e3f4`,
            locationId: locations[i % locations.length].id,
            address: `Jl. Sudirman No. ${i}, Blok A`,
            dateOfBirth: new Date(1990 + (i % 15), i % 12, (i % 28) + 1),
            gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
            portfolioUrl: i % 3 === 0 ? `https://portfolio.com/${fullName.replace(/ /g, '').toLowerCase()}` : null,
            linkedInUrl: `https://linkedin.com/in/${fullName.replace(/ /g, '').toLowerCase()}`,
            willingToRelocate: i % 4 === 0,
            maritalStatus: i % 3 === 0 ? MaritalStatus.SINGLE : MaritalStatus.MARRIED,
            taxId: `12.345.678.${i % 9}-012.000`,
            dependents: i % 3,
            nationality: 'Indonesian',
            educations: {
              create: [
                {
                  degree: "Bachelor's Degree",
                  institutionName: "Tech University",
                  fieldOfStudy: "Computer Science",
                  startDate: new Date(2018 - (i % 5), 8, 1),
                  endDate: new Date(2022 - (i % 5), 7, 30),
                  gpa: 3.5 + (i % 5) * 0.1
                }
              ]
            },
            experiences: {
              create: [
                {
                  jobTitle: "Junior Specialist",
                  companyName: `Previous Corp ${i}`,
                  startDate: new Date(2022 - (i % 5), 8, 1),
                  endDate: new Date(2023 - (i % 5), 7, 30),
                  description: "Worked on various tasks."
                },
                {
                  jobTitle: "Mid-level Specialist",
                  companyName: `Another Corp ${i}`,
                  startDate: new Date(2023 - (i % 5), 8, 1),
                  isCurrentJob: true,
                  description: "Leading the team."
                }
              ]
            },
            skills: {
              connect: [
                { id: allSkills[i % allSkills.length].id },
                { id: allSkills[(i + 1) % allSkills.length].id },
                { id: allSkills[(i + 2) % allSkills.length].id }
              ]
            }
          }
        }
      },
      include: { jobSeeker: true }
    });
    jobSeekers.push(user.jobSeeker!);
  }
  console.log(`Created 20 job seekers with Education, Experience, and Skills`);

  // 4. Resumes (1 per Job Seeker)
  for (let i = 0; i < 20; i++) {
    const randomSubCat = subCategories[i % subCategories.length];
    const randomSubCat2 = subCategories[(i + 1) % subCategories.length];
    
    await prisma.resume.create({
      data: {
        jobSeekerId: jobSeekers[i].id,
        subCategories: {
          connect: [{ id: randomSubCat.id }, { id: randomSubCat2.id }]
        },
        jobTitle: `Professional ${randomSubCat.name} Specialist`,
        expectedSalary: 5000000 + (i * 500000),
        isSearchable: true
      }
    });
  }
  console.log(`Created 20 resumes`);

  // 5. Job Vacancies (100 Vacancies)
  const employmentTypes = [EmploymentType.FULL_TIME, EmploymentType.PART_TIME, EmploymentType.REMOTE, EmploymentType.INTERNSHIP];
  
  for (let i = 1; i <= 100; i++) {
    const randomEmployer = employers[i % employers.length];
    const randomSubCat = subCategories[i % subCategories.length];
    const eType = employmentTypes[i % employmentTypes.length];
    const randomLocation = locations[i % locations.length];
    
    await prisma.jobVacancy.create({
      data: {
        employerId: randomEmployer.id,
        subCategories: {
          connect: [{ id: randomSubCat.id }]
        },
        title: `${['Senior', 'Junior', 'Lead', 'Staff'][i % 4]} ${randomSubCat.name} Engineer ${i}`,
        locationId: randomLocation.id,
        description: `We are looking for a highly skilled individual to join our team. Role #${i}.`,
        requirements: `Experience in ${randomSubCat.name}. Strong communication skills.`,
        salaryMin: 8000000 + (i * 100000),
        salaryMax: 15000000 + (i * 100000),
        employmentType: eType,
        status: VacancyStatus.ACTIVE,
        isPremium: i % 10 === 0 // Every 10th job is premium
      }
    });
  }

  console.log(`Created 100 job vacancies`);
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
