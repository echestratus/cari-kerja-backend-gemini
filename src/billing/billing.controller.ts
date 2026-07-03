import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { WebhookDto } from './dto/webhook.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@ApiTags('Billing & Webhook')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK) // Gateways expect a 200 OK
  @ApiOperation({ summary: 'Handle payment gateway webhook' })
  @ApiResponse({ status: 200, description: 'Webhook successfully processed or skipped via Idempotency' })
  @ApiResponse({ status: 400, description: 'Invalid signature or bad request' })
  async handleWebhook(@Body() webhookDto: WebhookDto) {
    return this.billingService.handleWebhook(webhookDto);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get transaction history (Employer only)' })
  @ApiResponse({ status: 200, description: 'List of transactions' })
  getHistory(@CurrentUser() user: JwtPayload) {
    return this.billingService.getHistory(user.sub);
  }
}
