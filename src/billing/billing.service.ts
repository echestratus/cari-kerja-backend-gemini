import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebhookDto } from './dto/webhook.dto';
import { Redis } from 'ioredis';
import * as crypto from 'crypto';

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async handleWebhook(webhookDto: WebhookDto) {
    const serverKey = process.env.PAYMENT_SERVER_KEY || 'test-server-key';
    
    // 1. Signature Verification (Common Midtrans format: order_id + gross_amount + serverKey)
    const payloadString = `${webhookDto.order_id}${webhookDto.gross_amount}${serverKey}`;
    const calculatedSignature = crypto
      .createHash('sha512')
      .update(payloadString)
      .digest('hex');

    if (calculatedSignature !== webhookDto.signature_key) {
      throw new BadRequestException('Invalid signature');
    }

    // 2. Idempotency Check using Redis
    const idempotencyKey = `webhook:processed:${webhookDto.order_id}`;
    
    // setnx returns 1 if key was set, 0 if it already exists
    const isNew = await this.redis.setnx(idempotencyKey, 'processing');
    if (!isNew) {
      return { message: 'Webhook already processed' }; // Return 200 OK immediately for duplicates
    }

    // Set expiry for the idempotency key (24 hours)
    await this.redis.expire(idempotencyKey, 24 * 60 * 60);

    // 3. Business Logic within Transaction
    try {
      await this.prisma.$transaction(async (tx) => {
        // Find the transaction
        const transaction = await tx.transaction.findUnique({
          where: { orderId: webhookDto.order_id },
        });

        if (!transaction) {
          throw new BadRequestException('Transaction not found');
        }

        // Safety check if already updated in DB directly
        if (transaction.status === 'SUCCESS') {
          return { success: true };
        }

        // Determine status
        const isSuccess = webhookDto.transaction_status === 'capture' || webhookDto.transaction_status === 'settlement';
        const newStatus = isSuccess ? 'SUCCESS' : (webhookDto.transaction_status === 'deny' || webhookDto.transaction_status === 'cancel' || webhookDto.transaction_status === 'expire' ? 'FAILED' : 'PENDING');

        // Update transaction status
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: newStatus },
        });

        // Atomically increment quota if successful
        if (isSuccess) {
          let jobPostingIncrement = 0;
          let resumeViewIncrement = 0;

          if (transaction.package === 'BASIC_JOB_POST') {
            jobPostingIncrement = 1;
          } else if (transaction.package === 'PREMIUM_JOB_POST') {
            jobPostingIncrement = 5;
          } else if (transaction.package === 'RESUME_VIEW_PACK') {
            resumeViewIncrement = 50;
          }

          if (jobPostingIncrement > 0 || resumeViewIncrement > 0) {
            await tx.employer.update({
              where: { id: transaction.employerId },
              data: {
                jobPostingQuota: { increment: jobPostingIncrement },
                resumeViewQuota: { increment: resumeViewIncrement },
              },
            });
          }
        }
      });
      
      // Update redis key to explicitly mark as successfully done
      await this.redis.set(idempotencyKey, 'done', 'EX', 24 * 60 * 60);
      
      return { message: 'Webhook processed successfully' };
    } catch (error) {
      // 4. Error Handling: Rollback Idempotency Key so it can be retried if DB fails
      await this.redis.del(idempotencyKey);
      throw error; // Let NestJS error filter handle the 500 response if it's a server error
    }
  }

  async getHistory(userId: string) {
    const employer = await this.prisma.employer.findUnique({
      where: { userId }
    });

    if (!employer) {
      throw new BadRequestException('Employer profile not found');
    }

    return this.prisma.transaction.findMany({
      where: { employerId: employer.id },
      orderBy: { createdAt: 'desc' }
    });
  }
}
