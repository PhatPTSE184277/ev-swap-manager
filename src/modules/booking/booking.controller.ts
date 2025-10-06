import { Controller, Get, Req, UseGuards, Query } from '@nestjs/common';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiTags,
    ApiQuery
} from '@nestjs/swagger';

@ApiTags('Booking')
@ApiBearerAuth()
@Controller('booking')
export class BookingController {
    constructor(private readonly bookingService: BookingService) {}

    @UseGuards(JwtAuthGuard)
    @Get('my')
    @ApiOperation({ summary: 'Lấy danh sách booking của user đang đăng nhập' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({
        name: 'search',
        required: false,
        type: String,
        description: 'Tìm kiếm theo tên xe'
    })
    @ApiQuery({
        name: 'month',
        required: false,
        type: Number,
        description: 'Lọc theo tháng (1-12)'
    })
    @ApiQuery({
        name: 'year',
        required: false,
        type: Number,
        description: 'Lọc theo năm (vd: 2025)'
    })
    async getMyBookings(
        @Req() req,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('month') month?: number,
        @Query('year') year?: number
    ) {
        const userId = req.user.id;
        const result = await this.bookingService.getBookingsByUser(
            userId,
            page,
            limit,
            search,
            month,
            year
        );
        return result;
    }
}
