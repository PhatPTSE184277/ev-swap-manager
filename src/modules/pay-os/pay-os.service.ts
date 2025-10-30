import { Injectable, Logger } from '@nestjs/common';
import { PayOS } from '@payos/node';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PayOSService {
    private readonly logger = new Logger(PayOSService.name);
    private payos: PayOS;

    constructor(private configService: ConfigService) {
        this.payos = new PayOS({
            clientId: this.configService.get<string>('PAYOS_CLIENT_ID'),
            apiKey: this.configService.get<string>('PAYOS_API_KEY'),
            checksumKey: this.configService.get<string>('PAYOS_CHECKSUM_KEY')
        });
    }

    async createPaymentLink(data: {
        orderCode: number;
        amount: number;
        description: string;
        returnUrl: string;
        cancelUrl: string;
        expiredAt?: number;
    }) {
        try {
            const payload: any = {
                orderCode: data.orderCode,
                amount: data.amount,
                description: data.description,
                returnUrl: data.returnUrl,
                cancelUrl: data.cancelUrl
            };

            if (data.expiredAt) {
                payload.expiredAt = data.expiredAt;
            }

            const paymentLinkRes =
                await this.payos.paymentRequests.create(payload);

            this.logger.log(
                `Created PayOS payment link for order ${data.orderCode}`
            );
            return paymentLinkRes;
        } catch (error) {
            this.logger.error('Error creating PayOS payment link:', error);
            throw error;
        }
    }

    async getPaymentInfo(orderCode: number) {
        try {
            return await this.payos.paymentRequests.get(orderCode);
        } catch (error) {
            this.logger.error('Error getting payment info:', error);
            throw error;
        }
    }

    async verifyPaymentWebhookData(webhookData: any) {
        try {
            const verified = await this.payos.webhooks.verify(webhookData);
            this.logger.log('Webhook verified successfully');
            return verified;
        } catch (error) {
            this.logger.error('Error verifying webhook:', error);
            return null;
        }
    }
}
