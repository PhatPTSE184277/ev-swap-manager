import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards
} from '@nestjs/common';
import { BatteryTypeService } from './battery-type.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateBatteryTypeDto } from './dto/create-battery-type.dto';
import { UpdateBatteryTypeDto } from './dto/update-battery-type.dto';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleName } from 'src/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Battery Types')
@ApiBearerAuth()
@Controller('battery-type')
export class BatteryTypeController {
    constructor(private readonly batteryTypeService: BatteryTypeService) {}

    @Get('public')
    @ApiOperation({
        summary: 'Lấy danh sách loại pin đang hoạt động cho user chọn',
        description: 'Public - chỉ trả về loại pin có status=true'
    })
    @ApiQuery({
        name: 'search',
        required: false,
        type: String,
        description: 'Tìm kiếm theo tên loại pin'
    })
    @ApiQuery({
        name: 'order',
        required: false,
        enum: ['ASC', 'DESC'],
        example: 'ASC',
        description: 'Sắp xếp theo tên'
    })
    async findAllPublic(
        @Query('search') search?: string,
        @Query('order') order: 'ASC' | 'DESC' = 'ASC'
    ) {
        return this.batteryTypeService.findAllPublic(
            1,
            1000,
            search,
            order,
            true
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Get()
    @ApiOperation({
        summary: 'Lấy danh sách loại pin (phân trang, filter, search)',
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
        description: 'Tìm kiếm theo tên loại pin'
    })
    @ApiQuery({
        name: 'order',
        required: false,
        enum: ['ASC', 'DESC'],
        example: 'ASC',
        description: 'Sắp xếp theo ngày tạo (ASC/DESC)'
    })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: ['true', 'false'],
        example: 'true',
        description: 'Lọc theo trạng thái hoạt động'
    })
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('order') order: 'ASC' | 'DESC' = 'ASC',
        @Query('status') status?: boolean | string
    ) {
        const result = await this.batteryTypeService.findAll(
            page,
            limit,
            search,
            order,
            status
        );
        return result;
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết loại pin', description: 'ADMIN' })
    @ApiParam({ name: 'id', type: Number, description: 'ID loại pin' })
    async findById(@Param('id') id: number) {
        const result = await this.batteryTypeService.findById(id);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Post()
    @ApiOperation({ summary: 'Tạo mới loại pin', description: 'ADMIN' })
    async create(@Body() createBatteryTypeDto: CreateBatteryTypeDto) {
        const result =
            await this.batteryTypeService.create(createBatteryTypeDto);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật loại pin', description: 'ADMIN' })
    @ApiParam({ name: 'id', type: Number, description: 'ID loại pin' })
    async update(
        @Param('id') id: number,
        @Body() updateBatteryTypeDto: UpdateBatteryTypeDto
    ) {
        const result = await this.batteryTypeService.update(
            id,
            updateBatteryTypeDto
        );
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Delete(':id')
    @ApiOperation({ summary: 'Xóa loại pin', description: 'ADMIN' })
    @ApiParam({ name: 'id', type: Number, description: 'ID loại pin' })
    async remove(@Param('id') id: number) {
        const result = await this.batteryTypeService.softDelete(id);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Patch('restore/:id')
    @ApiOperation({ summary: 'Khôi phục loại pin', description: 'ADMIN' })
    @ApiParam({ name: 'id', type: Number, description: 'ID loại pin' })
    async restore(@Param('id') id: number) {
        return this.batteryTypeService.restore(id);
    }
}
