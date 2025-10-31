import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiTags
} from '@nestjs/swagger';
import { ConfirmCashPaymentDto } from './dto/confirm-cash-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateMembershipTransactionDto } from './dto/update-membership-transaction.dto';

@ApiTags('Transaction')
@Controller('transaction')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) {}

    @Post('payos-webhook')
    @ApiOperation({
        summary: 'Webhook từ PayOS khi thanh toán thành công/thất bại'
    })
    async payosWebhook(@Body() webhookData: any) {
        const result =
            await this.transactionService.handlePayOSWebhook(webhookData);
        return result;
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get(':id/status')
    @ApiOperation({
        summary: 'Kiểm tra trạng thái thanh toán',
        description: 'User check xem transaction đã thanh toán thành công chưa'
    })
    @ApiParam({ name: 'id', type: Number, description: 'Transaction ID' })
    async checkStatus(@Param('id') id: number) {
        return this.transactionService.checkPaymentStatus(id);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('confirm-cash-payment')
    @ApiOperation({ summary: 'Staff xác nhận thanh toán tiền mặt' })
    async confirmCashPayment(@Body() dto: ConfirmCashPaymentDto) {
        return this.transactionService.confirmCashPayment(dto);
    }

    @Post('payos-callback')
    async payosCallback(@Body() dto: UpdateMembershipTransactionDto) {
        return this.transactionService.handlePayOSCallback(dto);
    }
}
