import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    UseGuards,
    Req,
    Param,
    Patch
} from '@nestjs/common';
import { ReportService } from './report.service';
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
import { ReportStatus } from 'src/enums/report.enum';
import { CreateReportDto } from './dto/create-report.dto';

@ApiTags('Report')
@ApiBearerAuth()
@Controller('report')
export class ReportController {
    constructor(private readonly reportService: ReportService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiOperation({ summary: 'Tạo báo cáo lỗi pin cho lần đổi pin' })
    async createReport(@Req() req, @Body() createReportDto: CreateReportDto) {
        const userId = req.user.id;
        return this.reportService.createReport(userId, createReportDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.STAFF)
    @Get('station/:stationId')
    @ApiOperation({ summary: 'Lấy danh sách báo cáo theo trạm (ADMIN)' })
    @ApiParam({ name: 'stationId', type: Number })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({
        name: 'search',
        required: false,
        type: String,
        description: 'Tìm kiếm mô tả lỗi'
    })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: ReportStatus,
        description: 'Lọc theo trạng thái báo cáo'
    })
    async getReportsByStation(
        @Param('stationId') stationId: number,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('status') status?: ReportStatus
    ) {
        return this.reportService.getReportsByStation(
            stationId,
            page,
            limit,
            search,
            status
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('booking/:bookingId')
    @ApiOperation({
        summary: 'Lấy danh sách báo cáo theo booking (USER, ADMIN, STAFF)'
    })
    @ApiParam({ name: 'bookingId', type: Number })
    @ApiQuery({
        name: 'search',
        required: false,
        type: String,
        description: 'Tìm kiếm mô tả lỗi'
    })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: ReportStatus,
        description: 'Lọc theo trạng thái báo cáo'
    })
    async getReportsByUserBooking(
        @Req() req,
        @Param('bookingId') bookingId: number,
        @Query('search') search?: string,
        @Query('status') status?: ReportStatus
    ) {
        const userId = req.user.id;
        const userRole = req.user.role?.name?.toUpperCase();
        return this.reportService.getReportsByUserBooking(
            userId,
            bookingId,
            userRole,
            search,
            status
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.STAFF)
    @Patch('confirm/:reportId')
    @ApiOperation({ summary: 'Xác nhận báo cáo lỗi pin (ADMIN)' })
    @ApiParam({ name: 'reportId', type: Number })
    async confirmReport(@Param('reportId') reportId: number) {
        return this.reportService.confirmReport(reportId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.STAFF)
    @Patch('reject/:reportId')
    @ApiOperation({ summary: 'Từ chối báo cáo lỗi pin (ADMIN)' })
    @ApiParam({ name: 'reportId', type: Number })
    async rejectReport(@Param('reportId') reportId: number) {
        return this.reportService.rejectReport(reportId);
    }
}
