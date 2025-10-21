import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
    UseGuards,
    Req
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleName } from 'src/enums/role.enum';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiTags,
    ApiQuery,
    ApiParam
} from '@nestjs/swagger';
import { BookingStatus } from 'src/enums/booking.enum';
import { CreateBookingDto } from './dto/create-booking.dto';

@ApiTags('Booking')
@ApiBearerAuth()
@Controller('booking')
export class BookingController {
    constructor(private readonly bookingService: BookingService) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Get()
    @ApiOperation({ summary: 'Lấy danh sách booking (ADMIN)' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({
        name: 'search',
        required: false,
        type: String,
        description: 'Tìm kiếm theo tên xe'
    })
    @ApiQuery({
        name: 'order',
        required: false,
        enum: ['ASC', 'DESC'],
        example: 'ASC',
        description: 'Sắp xếp theo ngày tạo (ASC/DESC)'
    })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: BookingStatus,
        description: 'Lọc theo trạng thái booking'
    })
    async findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
        @Query('order') order: 'ASC' | 'DESC' = 'ASC',
        @Query('status') status?: BookingStatus
    ) {
        return this.bookingService.getAllBookingsForAdmin(
            page,
            limit,
            search,
            order,
            status
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('my')
    @ApiOperation({ summary: 'Lấy danh sách booking của user đang đăng nhập' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Tìm kiếm theo tên xe' })
    @ApiQuery({ name: 'month', required: false, type: Number, description: 'Lọc theo tháng (1-12)' })
    @ApiQuery({ name: 'year', required: false, type: Number, description: 'Lọc theo năm (vd: 2025)' })
    async getMyBookings(
        @Req() req,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('month') month?: number,
        @Query('year') year?: number
    ) {
        const userId = req.user.id;
        return this.bookingService.getBookingsByUser(
            userId,
            page,
            limit,
            search,
            month,
            year
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiOperation({ summary: 'Tạo booking mới' })
    async createBooking(
        @Req() req,
        @Body() createBookingDto: CreateBookingDto
    ) {
        const userId = req.user.id;
        return this.bookingService.createBooking(userId, createBookingDto);
    }
}
