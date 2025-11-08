import {
    Body,
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Query,
    Req,
    UseGuards
} from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportStatus } from 'src/enums/report.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleName } from 'src/enums';

@Controller('report')
export class ReportController {
    constructor(private readonly reportService: ReportService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async createReport(@Req() req, @Body() dto: CreateReportDto) {
        const userId = req.user.id;
        return this.reportService.createReport(userId, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('by-station')
    @Roles(RoleName.STAFF, RoleName.ADMIN)
    async getReportsByStation(
        @Query('stationId') stationId: number,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('status') status?: ReportStatus
    ) {
        return this.reportService.getReportsByStation(
            Number(stationId),
            Number(page),
            Number(limit),
            search,
            status
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('by-user-booking')
    async getReportsByUserBooking(
        @Req() req,
        @Query('bookingId') bookingId: number,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('status') status?: ReportStatus
    ) {
        const userId = req.user.id;
        return this.reportService.getReportsByUserBooking(
            userId,
            Number(bookingId),
            Number(page),
            Number(limit),
            search,
            status
        );
    }

    @UseGuards(JwtAuthGuard)
    @Roles(RoleName.STAFF, RoleName.ADMIN)
    @Patch(':id/confirm')
    async confirmReport(@Param('id') id: number) {
        return this.reportService.confirmReport(Number(id));
    }

    @UseGuards(JwtAuthGuard)
    @Roles(RoleName.STAFF, RoleName.ADMIN)
    @Patch(':id/reject')
    async rejectReport(@Param('id') id: number) {
        return this.reportService.rejectReport(Number(id));
    }
}
