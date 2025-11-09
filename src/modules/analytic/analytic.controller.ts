import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticService } from './analytic.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleName } from 'src/enums';

@Controller('analytic')
export class AnalyticController {
    constructor(private readonly analyticService: AnalyticService) {}

    @Get('total-revenue-by-date')
    @Roles(RoleName.ADMIN)
    async getTotalRevenueByDate(@Query('date') date: string) {
        if (!date) {
            return { message: 'Missing date query param' };
        }
        const total = await this.analyticService.getTotalRevenueByDate(date);
        return { date, totalRevenue: total };
    }

    @Get('booking/by-station')
    @Roles(RoleName.STAFF)
    async getBookingCountByStation() {
        const result = await this.analyticService.countBookingsByStation();
        return result;
    }

    @Get('booking-detail')
    @Roles(RoleName.ADMIN)
    async getCompletedBookingDetailCount() {
        const count = await this.analyticService.countCompletedBookingDetails();
        return { completedBookingDetail: count };
    }
}