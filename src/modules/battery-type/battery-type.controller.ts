import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { BatteryTypeService } from './battery-type.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateBatteryTypeDto } from './dto/create-battery-type.dto';
import { UpdateBatteryTypeDto } from './dto/update-battery-type.dto';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('Battery Types')
@ApiBearerAuth()
@Controller('battery-type')
export class BatteryTypeController {
    constructor(private readonly batteryTypeService: BatteryTypeService) {}

    @Get()
    @ApiOperation({
        summary: 'Lấy danh sách loại pin (phân trang, filter, search)',
        description: 'ADMIN'
    })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Trang hiện tại' })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Số lượng mỗi trang' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Tìm kiếm theo tên loại pin' })
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
        @Query('status') status: boolean | string = true
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

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết loại pin', description: 'ADMIN' })
    @ApiParam({ name: 'id', type: Number, description: 'ID loại pin' })
    async findById(@Param('id') id: number) {
        const result = await this.batteryTypeService.findById(id);
        return result;
    }

    @Post()
    @ApiOperation({ summary: 'Tạo mới loại pin', description: 'ADMIN' })
    async create(@Body() createBatteryTypeDto: CreateBatteryTypeDto) {
        const result = await this.batteryTypeService.create(createBatteryTypeDto);
        return result;
    }

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

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa loại pin', description: 'ADMIN' })
    @ApiParam({ name: 'id', type: Number, description: 'ID loại pin' })
    async remove(@Param('id') id: number) {
        const result = await this.batteryTypeService.remove(id);
        return result;
    }
}