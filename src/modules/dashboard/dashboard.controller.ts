import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleName } from 'src/enums/role.enum';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiTags,
    ApiQuery
} from '@nestjs/swagger';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Get('user-count')
    @ApiOperation({ summary: 'Đếm số lượng user có role USER (ADMIN)' })
    async countUsers() {
        return await this.dashboardService.countUsers();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Get('station-count')
    @ApiOperation({ summary: 'Đếm số lượng trạm (ADMIN)' })
    async countStations() {
        return await this.dashboardService.countStations();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Get('active-booking-count')
    @ApiOperation({
        summary: 'Đếm số lượng booking COMPLETED theo tháng/năm (ADMIN)'
    })
    @ApiQuery({ name: 'month', required: true, type: Number })
    @ApiQuery({ name: 'year', required: true, type: Number })
    async countActiveBookingsByMonthYear(
        @Query('month') month: number,
        @Query('year') year: number
    ) {
        return await this.dashboardService.countActiveBookingsByMonthYear(
            month,
            year
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Get('active-user-membership-count')
    @ApiOperation({
        summary: 'Đếm số lượng user membership ACTIVE theo tháng/năm (ADMIN)'
    })
    @ApiQuery({ name: 'month', required: true, type: Number })
    @ApiQuery({ name: 'year', required: true, type: Number })
    async countActiveUserMembershipsByMonthYear(
        @Query('month') month: number,
        @Query('year') year: number
    ) {
        return await this.dashboardService.countActiveUserMembershipsByMonthYear(
            month,
            year
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Get('transaction-chart')
    @ApiOperation({
        summary: 'Lấy tổng transaction theo ngày để vẽ chart (ADMIN)'
    })
    @ApiQuery({
        name: 'from',
        required: true,
        type: String,
        description: 'Ngày bắt đầu (YYYY-MM-DD)'
    })
    @ApiQuery({
        name: 'to',
        required: true,
        type: String,
        description: 'Ngày kết thúc (YYYY-MM-DD)'
    })
    async getTransactionChart(
        @Query('from') from: string,
        @Query('to') to: string
    ) {
        return await this.dashboardService.getTransactionChart(
            new Date(from),
            new Date(to)
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Get('revenue-chart')
    @ApiOperation({ summary: 'Lấy doanh thu từng tháng trong năm (ADMIN)' })
    @ApiQuery({ name: 'year', required: true, type: Number })
    async getRevenueChart(@Query('year') year: number) {
        return await this.dashboardService.getRevenueChart(year);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Get('top-stations')
    @ApiOperation({
        summary: 'Lấy top 3 trạm đặt nhiều nhất và ít nhất (ADMIN)'
    })
    async getTopStations() {
        return await this.dashboardService.getTopStations();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Get('top-avg-rating-stations')
    @ApiOperation({
        summary: 'Lấy trạm rating trung bình cao nhất và thấp nhất (ADMIN)'
    })
    async getTopAvgRatingStations() {
        return await this.dashboardService.getTopAvgRatingStations();
    }

    @Get('user-membership')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @ApiQuery({ name: 'month', required: true, type: Number })
    @ApiQuery({ name: 'year', required: true, type: Number })
    @ApiOperation({
        summary: 'Thống kê số người dùng đăng ký gói theo tháng/năm (ADMIN)'
    })
    async getUserMembershipStatsByMonthYear(
        @Query('month') month: number,
        @Query('year') year: number
    ) {
        return await this.dashboardService.getUserMembershipStatsByMonthYear(
            month,
            year
        );
    }
}
