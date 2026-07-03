# Cari Kerja Backend API 🚀

A highly scalable, production-ready backend API for a Professional Job Portal platform. Built with modern backend technologies and designed with a robust architecture that mimics enterprise standards.

## 🛠 Tech Stack
- **Framework:** [NestJS](https://nestjs.com/)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** JWT (JSON Web Tokens) with Passport

## ✨ Key Features
- **Multi-Role RBAC:** Secure role-based access control for `ADMIN`, `EMPLOYER`, and `JOB_SEEKER`.
- **Master Profile Architecture:** Job seekers can store their lifetime data (Experiences, Educations, Skills, Certificates).
- **Tailored Resumes (CV Builder):** Dynamic relations allowing job seekers to select a specific subset of their master profile data to generate tailored CVs for specific applications.
- **ATS Pipeline:** Built-in Applicant Tracking System flows for employers to manage candidates (Reviewed, Shortlisted, Hired, Rejected).
- **File Handling:** Integrated local storage solutions using `multer` for Avatars and CV Documents.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v15+)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/echestratus/cari-kerja-backend-gemini.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (`.env`):
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/job_portal_db"
   JWT_SECRET="your_super_secret_key"
   ```
4. Push the database schema:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

### Running the App
```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## 📜 API Documentation
Comprehensive API documentation is available via Swagger. Once the server is running, navigate to:
`http://localhost:3000/api/docs`
