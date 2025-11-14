import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleName } from 'src/enums/role.enum';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('History')
@ApiBearerAuth()
@Controller('history')
export class HistoryController {
    constructor(private readonly historyService: HistoryService) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Get('staff/all')
    @ApiOperation({
        summary: 'Lấy tất cả lịch sử staff (ADMIN)',
        description: 'Admin xem lịch sử làm việc của tất cả staff'
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        example: 1
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        example: 10
    })
    async getAllStaffHistory(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        return this.historyService.getAllStaffHistory(page, limit);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.STAFF, RoleName.ADMIN)
    @Get('staff/me')
    @ApiOperation({
        summary: 'Lấy lịch sử làm việc của chính mình (STAFF)',
        description: 'Staff xem lịch sử làm việc của bản thân'
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        example: 1
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        example: 10
    })
    async getMyStaffHistory(
        @Request() req,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        const userId = req.user.id;
        return this.historyService.getMyStaffHistory(userId, page, limit);
    }
}