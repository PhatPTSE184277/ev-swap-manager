import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    Post,
    Query,
    Req,
    UseGuards
} from '@nestjs/common';
import { StationStaffService } from './station-staff.service';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiQuery,
    ApiTags
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleName } from 'src/enums';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TransferStationDto } from './dto/transferstation.dto';

@ApiTags('StationStaff')
@ApiBearerAuth()
@Controller('station-staff')
export class StationStaffController {
    constructor(private readonly stationStaffService: StationStaffService) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Get()
    @ApiOperation({
        summary: 'Lấy danh sách nhân viên trạm (phân trang, filter)'
    })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'status', required: false, type: Boolean })
    @ApiQuery({ name: 'stationId', required: false, type: Number })
    @ApiQuery({ name: 'isHead', required: false, type: Boolean })
    async getAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('status') status?: boolean,
        @Query('stationId') stationId?: number,
        @Query('isHead') isHead?: boolean
    ) {
        return this.stationStaffService.getAllStationStaff(
            page,
            limit,
            search,
            status,
            stationId,
            isHead
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.STAFF)
    @Get('by-station')
    @ApiOperation({
        summary:
            'Staff lấy danh sách nhân viên của trạm mình (phân trang, filter)'
    })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'status', required: false, type: Boolean })
    async getByStation(
        @Req() req,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('status') status?: boolean
    ) {
        const staff = await this.stationStaffService.findByUserId(req.user.id);
        if (!staff || !staff.isHead) {
            throw new ForbiddenException(
                'Bạn không phải trưởng trạm, không có quyền truy cập'
            );
        }
        return this.stationStaffService.getStationStaffByStation(
            req.user.stationId,
            page,
            limit,
            search,
            status
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Post('transfer')
    @ApiOperation({ summary: 'Chuyển trạm cho nhân viên (có lưu history)' })
    @ApiBody({ type: TransferStationDto })
    async transferStation(@Body() transferDto: TransferStationDto) {
        return this.stationStaffService.transferStation(transferDto);
    }
}
