import { Injectable, Logger } from '@nestjs/common';
import { PayOS } from '@payos/node';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PayOSService {
    private readonly logger = new Logger(PayOSService.name);
    private payos;

    constructor(private configService: ConfigService) {
        this.payos = new PayOS(
          {
            clientId: this.configService.get<string>('PAYOS_CLIENT_ID'),
            apiKey: this.configService.get<string>('PAYOS_API_KEY'),
            checksumKey: this.configService.get<string>('PAYOS_CHECKSUM_KEY'),
          }
        );
    }

    async createPaymentLink(data: {
        orderCode: number;
        amount: number;
        description: string;
        returnUrl: string;
        cancelUrl: string;
    }) {
        try {
            const paymentData = {
                orderCode: data.orderCode,
                amount: data.amount,
                description: data.description,
                returnUrl: data.returnUrl,
                cancelUrl: data.cancelUrl
            };

            const paymentLinkRes = await this.payos.createPaymentLink(paymentData);
            this.logger.log(`Created PayOS payment link for order ${data.orderCode}`);
            return paymentLinkRes;
        } catch (error) {
            this.logger.error('Error creating PayOS payment link:', error);
            throw error;
        }
    }

    async getPaymentInfo(orderCode: number) {
        try {
            return await this.payos.getPaymentLinkInformation(orderCode);
        } catch (error) {
            this.logger.error('Error getting payment info:', error);
            throw error;
        }
    }

    verifyPaymentWebhookData(webhookData: any) {
        try {
            return this.payos.verifyPaymentWebhookData(webhookData);
        } catch (error) {
            this.logger.error('Error verifying webhook:', error);
            return null;
        }
    }
}