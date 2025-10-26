import { Controller, Get, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách phương thức thanh toán (phân trang, tìm kiếm)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: Boolean, example: true })
  async getActivePayments(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('status') status: boolean = true
  ) {
    return this.paymentService.getActivePayments(page, limit, search, status);
  }
}