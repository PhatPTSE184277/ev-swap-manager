import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { BatteryTypeService } from './battery-type.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateBatteryTypeDto } from './dto/create-battery-type.dto';

@ApiTags('Battery Types')
@Controller('battery-type')
export class BatteryTypeController {
    constructor(private readonly batteryTypeService: BatteryTypeService) {}

    @Get()
    @ApiQuery({ name: 'page', required: true, type: Number })
    @ApiQuery({ name: 'limit', required: true, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({
        name: 'order',
        required: false,
        enum: ['ASC', 'DESC'],
        example: 'ASC',
        description: 'Sort order'
    })
    @ApiQuery({ name: 'status', required: false, enum: ['true', 'false'], default: 'true', description: 'Filter by status' })
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
    async findById(@Param('id') id: number) {
        const result = await this.batteryTypeService.findById(id);
        return result;
    }

    @Post()
    async create(@Body() createBatteryTypeDto: CreateBatteryTypeDto) {
        const result = await this.batteryTypeService.create(createBatteryTypeDto);
        return result;
    }

    @Patch(':id')
    async update(
        @Param('id') id: number,
        @Body() updateBatteryTypeDto: CreateBatteryTypeDto
    ) {
        const result = await this.batteryTypeService.update(
            id,
            updateBatteryTypeDto
        );
        return result;
    }

    @Delete(':id')
    async remove(@Param('id') id: number) {
        const result = await this.batteryTypeService.remove(id);
        return result;
    }
}
