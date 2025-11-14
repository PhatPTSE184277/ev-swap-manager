import { Controller, Get, UseGuards, Query, Request } from '@nestjs/common';
import { StaffDashboardService } from './staff-dashboard.service';
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

@ApiTags('Staff Dashboard')
@ApiBearerAuth()
@Controller('staff-dashboard')
export class StaffDashboardController {
    constructor(
        private readonly staffDashboardService: StaffDashboardService
    ) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.STAFF)
    @Get('transaction-chart')
    @ApiOperation({
        summary: 'Lấy tổng transaction theo ngày của trạm (STAFF)'
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
        @Request() req,
        @Query('from') from: string,
        @Query('to') to: string
    ) {
        const stationId = req.user.stationId; // Lấy stationId từ token JWT
        return await this.staffDashboardService.getTransactionChartByStation(
            stationId,
            new Date(from),
            new Date(to)
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.STAFF)
    @Get('revenue-chart')
    @ApiOperation({
        summary: 'Lấy doanh thu từng tháng trong năm của trạm (STAFF)'
    })
    @ApiQuery({ name: 'year', required: true, type: Number })
    async getRevenueChart(@Request() req, @Query('year') year: number) {
        const stationId = req.user.stationId;
        return await this.staffDashboardService.getRevenueChartByStation(
            stationId,
            year
        );
    }
}
