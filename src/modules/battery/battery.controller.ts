import { Controller, Get, Param, Query } from '@nestjs/common';
import { BatteryService } from './battery.service';
import { ApiQuery } from '@nestjs/swagger';
import { fail } from 'assert';

@Controller('battery')
export class BatteryController {
    constructor(private readonly batteryService: BatteryService) {}

    @Get()
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({
        name: 'order',
        required: false,
        enum: ['ASC', 'DESC'],
        example: 'ASC',
        description: 'Sort order'
    })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: ['AVAILABLE', 'IN_USE', 'CHARGING', 'MAINTENANCE', 'DAMAGED'],
        description: 'Filter by battery status'
    })
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('order') order: 'ASC' | 'DESC' = 'ASC',
        @Query('status') status?: string
    ) {
        const result = await this.batteryService.findAll(
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
        const result = await this.batteryService.findById(id);
        return result;
    }

    @Get('statuses')
    getAllStatuses() {
        const result = this.batteryService.getAllStatuses();
        return result;
    }
}
