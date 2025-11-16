import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards
} from '@nestjs/common';
import { BatteryService } from './battery.service';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
    ApiParam
} from '@nestjs/swagger';
import { BatteryStatus } from 'src/enums/battery.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleName } from 'src/enums';
import { CreateBatteryDto } from './dto/create-battery.dto';
import { UpdateBatteryDto } from './dto/update-battery.dto';
import { CreateUserBatteryDto } from './dto/create-user-battery.dto';

@ApiTags('Battery')
@ApiBearerAuth()
@Controller('battery')
export class BatteryController {
    constructor(private readonly batteryService: BatteryService) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Get()
    @ApiOperation({
        summary: 'Lấy danh sách pin (phân trang, filter, search)',
        description: 'Chỉ ADMIN'
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        example: 1,
        description: 'Trang hiện tại'
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        example: 10,
        description: 'Số lượng mỗi trang'
    })
    @ApiQuery({
        name: 'search',
        required: false,
        type: String,
        description: 'Tìm kiếm theo model pin'
    })
    @ApiQuery({
        name: 'order',
        required: false,
        enum: ['ASC', 'DESC'],
        example: 'ASC',
        description: 'Sắp xếp theo model (ASC/DESC)'
    })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: BatteryStatus,
        description: 'Lọc theo trạng thái pin'
    })
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('order') order: 'ASC' | 'DESC' = 'ASC',
        @Query('status') status?: BatteryStatus
    ) {
        return this.batteryService.findAll(page, limit, search, order, status);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Get(':id')
    @ApiOperation({
        summary: 'Lấy chi tiết pin',
        description: 'Chỉ ADMIN hoặc STAFF'
    })
    @ApiParam({ name: 'id', type: Number, description: 'ID pin' })
    async findById(@Param('id') id: number) {
        return this.batteryService.findById(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Post()
    @ApiOperation({ summary: 'Tạo mới pin', description: 'Chỉ ADMIN' })
    async create(@Body() createBatteryDto: CreateBatteryDto) {
        return this.batteryService.create(createBatteryDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('type/:batteryTypeId')
    @ApiOperation({
        summary: 'Lấy danh sách pin theo loại',
        description: 'Chỉ ADMIN'
    })
    @ApiParam({
        name: 'batteryTypeId',
        type: Number,
        description: 'ID loại pin'
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        example: 1,
        description: 'Trang hiện tại'
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        example: 10,
        description: 'Số lượng mỗi trang'
    })
    @ApiQuery({
        name: 'search',
        required: false,
        type: String,
        description: 'Tìm kiếm theo model pin'
    })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: BatteryStatus,
        description: 'Lọc theo trạng thái pin'
    })
    async getBatteryByType(
        @Param('batteryTypeId') batteryTypeId: number,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('status') status?: BatteryStatus
    ) {
        return this.batteryService.getBatteryByType(
            batteryTypeId,
            page,
            limit,
            search,
            status
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật pin', description: 'Chỉ ADMIN' })
    @ApiParam({ name: 'id', type: Number, description: 'ID pin' })
    async update(
        @Param('id') id: number,
        @Body() updateBatteryDto: UpdateBatteryDto
    ) {
        return this.batteryService.update(id, updateBatteryDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.STAFF, RoleName.ADMIN)
    @Post('staff-create')
    @ApiOperation({
        summary: 'Staff tạo pin và gắn vào xe của user',
        description:
            'Nhân viên ghi nhận tình trạng pin thực tế và gắn vào xe người dùng'
    })
    async staffCreateBatteryForUserVehicle(@Body() dto: CreateUserBatteryDto) {
        return this.batteryService.staffCreateBatteryForUserVehicle(dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Get('warehouse')
    @ApiOperation({
        summary:
            'Lấy danh sách pin trong kho (inUse = false, không thuộc request TRANSFERRING)',
        description: 'ADMIN'
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        example: 1,
        description: 'Trang hiện tại'
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        example: 10,
        description: 'Số lượng mỗi trang'
    })
    @ApiQuery({
        name: 'search',
        required: false,
        type: String,
        description: 'Tìm kiếm theo model pin'
    })
    @ApiQuery({
        name: 'batteryTypeId',
        required: false,
        type: Number,
        description: 'Lọc theo loại pin'
    })
    async getBatteriesInWarehouse(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
        @Query('batteryTypeId') batteryTypeId?: number
    ) {
        return this.batteryService.getBatteriesInWarehouse(
            page,
            limit,
            search,
            batteryTypeId
        );
    }
}
