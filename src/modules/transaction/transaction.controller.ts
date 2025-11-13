import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    Req,
    UseGuards
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags
} from '@nestjs/swagger';
import { ConfirmCashPaymentDto } from './dto/confirm-cash-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateMembershipTransactionDto } from './dto/update-membership-transaction.dto';
import { TransactionStatus } from 'src/enums';

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

    @Post('payos-callback-booking')
    @ApiOperation({ summary: 'Callback PayOS cho booking onsite' })
    async payosCallbackBooking(@Body() dto: UpdateMembershipTransactionDto) {
        return this.transactionService.handlePayOSCallbackForBooking(dto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('all')
    @ApiOperation({
        summary: 'Admin lấy danh sách transaction (phân trang, lọc)'
    })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'] })
    @ApiQuery({ name: 'status', required: false, enum: TransactionStatus })
    async getAllTransactionsForAdmin(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
        @Query('order') order?: 'ASC' | 'DESC',
        @Query('status') status?: TransactionStatus
    ) {
        return this.transactionService.getAllTransactionsForAdmin(
            page,
            limit,
            search,
            order,
            status
        );
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('by-station')
    @ApiOperation({
        summary: 'Staff lấy danh sách transaction booking theo trạm'
    })
    @ApiQuery({ name: 'stationId', required: true, type: Number })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'] })
    @ApiQuery({ name: 'status', required: false, enum: TransactionStatus })
    async getTransactionsByStationForStaff(
        @Query('stationId') stationId: number,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
        @Query('order') order?: 'ASC' | 'DESC',
        @Query('status') status?: TransactionStatus
    ) {
        return this.transactionService.getTransactionsByStationForStaff(
            Number(stationId),
            Number(page) || 1,
            Number(limit) || 10,
            search,
            order || 'DESC',
            status
        );
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('by-user')
    @ApiOperation({
        summary: 'User lấy danh sách transaction của mình (phân trang, lọc)'
    })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'] })
    @ApiQuery({ name: 'status', required: false, enum: TransactionStatus })
    async getTransactionsByUser(
        @Req() req,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
        @Query('order') order?: 'ASC' | 'DESC',
        @Query('status') status?: TransactionStatus
    ) {
        const userId = req.user.id;
        return this.transactionService.getTransactionsByUser(
            userId,
            Number(page) || 1,
            Number(limit) || 10,
            search,
            order || 'DESC',
            status
        );
    }
}
