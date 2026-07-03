import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as nodemailer from 'nodemailer';

@Processor('mail-queue')
export class MailProcessor extends WorkerHost {
  private transporter: nodemailer.Transporter;

  constructor() {
    super();
    // Using Ethereal Mail for mocked configuration
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'mock_user@ethereal.email',
        pass: 'mock_password'
      }
    });
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'rejection-email') {
      const { email, vacancyTitle, seekerName } = job.data;
      
      console.log(`[Mail Processor] Sending rejection email to ${email}`);
      
      const info = await this.transporter.sendMail({
        from: '"Job Portal ATS" <no-reply@jobportal.com>',
        to: email,
        subject: `Update on your application for ${vacancyTitle}`,
        text: `Dear ${seekerName},\n\nThank you for applying to the ${vacancyTitle} position. Unfortunately, we have decided to move forward with other candidates at this time.\n\nBest regards,\nThe Recruitment Team`,
      });

      console.log('Message sent: %s', info.messageId);
    }
  }
}
