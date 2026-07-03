import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class WebhookDto {
  @IsString()
  @IsNotEmpty()
  order_id: string;

  @IsString()
  @IsNotEmpty()
  transaction_status: string;

  @IsString()
  @IsNotEmpty()
  signature_key: string;

  @IsNumber()
  @IsNotEmpty()
  gross_amount: number;
}
