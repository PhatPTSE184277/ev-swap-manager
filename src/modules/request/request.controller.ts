import {
    Controller,
    Get,
    Query,
    Param,
    UseGuards,
    Post,
    Body,
    Patch,
    Req,
} from '@nestjs/common';
import { RequestService } from './request.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleName } from 'src/enums/role.enum';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiTags,
    ApiQuery,
    ApiParam,
    ApiCreatedResponse,
    ApiBody
} from '@nestjs/swagger';
import { RequestStatus } from 'src/enums';
import { CreateRequestDto } from './dto/create-request.dto';
import { AcceptRequestDto } from './dto/accept-request.dto';

@ApiTags('Request')
@ApiBearerAuth()
@Controller('request')
export class RequestController {
    constructor(private readonly requestService: RequestService) {}

    // STAFF gửi yêu cầu cấp pin cho trạm
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.STAFF)
    @Post()
    @ApiOperation({ summary: 'STAFF gửi yêu cầu cấp pin cho trạm' })
    @ApiBody({ type: CreateRequestDto })
    @ApiCreatedResponse({ description: 'Tạo yêu cầu cấp pin thành công' })
    async createRequest(@Body() dto: CreateRequestDto, @Req() req: any) {
        return this.requestService.createRequest(dto, req.user.id);
    }

    // ADMIN chấp nhận yêu cầu và cấp pin
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Patch(':id/accept')
    @ApiOperation({ summary: 'ADMIN chấp nhận yêu cầu và cấp pin' })
    @ApiParam({ name: 'id', required: true, type: Number })
    @ApiBody({ type: AcceptRequestDto })
    async acceptRequest(
        @Param('id') id: number,
        @Body() dto: AcceptRequestDto
    ) {
        return this.requestService.acceptRequest(id, dto);
    }

    // ADMIN từ chối yêu cầu cấp pin
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Patch(':id/reject')
    @ApiOperation({ summary: 'ADMIN từ chối yêu cầu cấp pin' })
    @ApiParam({ name: 'id', required: true, type: Number })
    @ApiBody({
        schema: {
            properties: {
                note: { type: 'string' }
            },
            required: ['note']
        }
    })
    async rejectRequest(@Param('id') id: number, @Body('note') note: string) {
        return this.requestService.rejectRequest(id, note);
    }

    // ADMIN xem tất cả yêu cầu cấp pin
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Get()
    @ApiOperation({ summary: 'ADMIN xem tất cả yêu cầu cấp pin' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({
        name: 'order',
        required: false,
        enum: ['ASC', 'DESC'],
        example: 'DESC'
    })
    @ApiQuery({ name: 'status', required: false, enum: RequestStatus })
    async getAllRequestsForAdmin(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('status') status?: RequestStatus,
        @Query('order') order: 'ASC' | 'DESC' = 'DESC'
    ) {
        return this.requestService.getAllRequestsForAdmin(
            page,
            limit,
            status,
            order
        );
    }

    // STAFF xem các yêu cầu cấp pin của trạm mình
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.STAFF)
    @Get('station/:stationId')
    @ApiOperation({ summary: 'STAFF xem các yêu cầu cấp pin của trạm mình' })
    @ApiParam({ name: 'stationId', required: true, type: Number })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'status', required: false, enum: RequestStatus })
    @ApiQuery({
        name: 'order',
        required: false,
        enum: ['ASC', 'DESC'],
        example: 'DESC'
    })
    async getRequestsByStation(
        @Param('stationId') stationId: number,
        @Req() req: any,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('status') status?: RequestStatus,
        @Query('order') order: 'ASC' | 'DESC' = 'DESC'
    ) {

        const userId = req.user.id;
        return this.requestService.getRequestsByStation(
            stationId,
            userId,
            page,
            limit,
            status,
            order
        );
    }
}
