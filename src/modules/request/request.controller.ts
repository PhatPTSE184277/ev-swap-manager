import {
    Controller,
    Get,
    Query,
    Param,
    UseGuards,
    Req,
    Post,
    Body
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

@ApiTags('Request')
@ApiBearerAuth()
@Controller('request')
export class RequestController {
    constructor(private readonly requestService: RequestService) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Post()
    @ApiOperation({ summary: 'Tạo yêu cầu chuyển pin giữa các trạm (ADMIN)' })
    @ApiBody({ type: CreateRequestDto })
    @ApiCreatedResponse({
        description: 'Tạo yêu cầu chuyển đổi trạm thành công'
    })
    async createRequest(@Body() dto: CreateRequestDto) {
        return this.requestService.createRequest(dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Get()
    @ApiOperation({ summary: 'Lấy danh sách request (ADMIN)' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'search', required: false, type: String })
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
        @Query('search') search?: string,
        @Query('order') order: 'ASC' | 'DESC' = 'DESC'
    ) {
        return this.requestService.getAllRequestsForAdmin(
            page,
            limit,
            status,
            search,
            order
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('station/:stationId')
    @ApiOperation({ summary: 'Lấy danh sách request theo trạm (STAFF)' })
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
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('status') status?: RequestStatus,
        @Query('order') order: 'ASC' | 'DESC' = 'DESC'
    ) {
        return this.requestService.getRequestsByStation(
            stationId,
            page,
            limit,
            status,
            order
        );
    }
}
