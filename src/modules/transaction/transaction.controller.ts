import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Transaction')
@Controller('transaction')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) {}

    @Post('payos-webhook')
    @ApiOperation({ summary: 'Webhook từ PayOS khi thanh toán thành công/thất bại' })
    async payosWebhook(@Body() webhookData: any) {
        return this.transactionService.handlePayOSWebhook(webhookData);
    }

    @Get(':id/status')
    @ApiOperation({ summary: 'Kiểm tra trạng thái thanh toán' })
    async checkStatus(@Param('id') id: number) {
        return this.transactionService.checkPaymentStatus(id);
    }

    @Post('confirm-cash-payment')
    @ApiOperation({ summary: 'Staff xác nhận thanh toán tiền mặt cho booking onsite' })
    async confirmCashPayment(@Body() dto: { transactionId: number }) {
        return this.transactionService.confirmCashPayment(dto);
    }
}