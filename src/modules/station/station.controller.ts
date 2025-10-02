import {
    Controller,
    Get,
    Param,
    Query,
    UseGuards,
    Post,
    Body,
    Patch,
    Delete
} from '@nestjs/common';
import { StationService } from './station.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleName } from 'src/enums/role.enum';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags
} from '@nestjs/swagger';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';

@ApiTags('Station')
@ApiBearerAuth()
@Controller('station')
export class StationController {
    constructor(private readonly stationService: StationService) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Get()
    @ApiOperation({
        summary: 'Lấy danh sách trạm (phân trang, filter, search)',
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
        description: 'Tìm kiếm theo tên trạm'
    })
    @ApiQuery({
        name: 'order',
        required: false,
        enum: ['ASC', 'DESC'],
        example: 'ASC',
        description: 'Sắp xếp theo tên trạm (ASC/DESC)'
    })
    @ApiQuery({
        name: 'status',
        required: false,
        type: Boolean,
        description: 'Lọc theo trạng thái hoạt động của trạm'
    })
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('order') order: 'ASC' | 'DESC' = 'ASC',
        @Query('status') status?: boolean
    ) {
        const result = await this.stationService.findAll(
            page,
            limit,
            search,
            order,
            status
        );
        return result;
    }

    @Get('public')
    @ApiOperation({
        summary: 'Lấy danh sách trạm cho user (chỉ trạm đang hoạt động)',
        description: 'Ai cũng gọi được, chỉ trả về trạm có status=true'
    })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({
        name: 'order',
        required: false,
        enum: ['ASC', 'DESC'],
        example: 'ASC'
    })
    async findAllPublic(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('order') order: 'ASC' | 'DESC' = 'ASC'
    ) {
        const result = await this.stationService.findAll(
            page,
            limit,
            search,
            order,
            true
        );
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN, RoleName.STAFF)
    @Get(':id')
    @ApiOperation({
        summary: 'Lấy chi tiết trạm',
        description: 'Chỉ ADMIN hoặc STAFF'
    })
    @ApiParam({ name: 'id', type: Number, description: 'ID trạm' })
    async findById(@Param('id') id: number) {
        const result = await this.stationService.findById(id);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Post()
    @ApiOperation({ summary: 'Tạo mới trạm', description: 'Chỉ ADMIN' })
    async create(@Body() createStationDto: CreateStationDto) {
        return this.stationService.create(createStationDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật trạm', description: 'Chỉ ADMIN' })
    @ApiParam({ name: 'id', type: Number, description: 'ID trạm' })
    async update(
        @Param('id') id: number,
        @Body() updateStationDto: UpdateStationDto
    ) {
        return this.stationService.update(id, updateStationDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Delete(':id')
    @ApiOperation({ summary: 'Xóa mềm trạm', description: 'Chỉ ADMIN' })
    @ApiParam({ name: 'id', type: Number, description: 'ID trạm' })
    async softDelete(@Param('id') id: number) {
        return this.stationService.softDelete(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Patch('restore/:id')
    @ApiOperation({ summary: 'Khôi phục trạm', description: 'Chỉ ADMIN' })
    @ApiParam({ name: 'id', type: Number, description: 'ID trạm' })
    async restore(@Param('id') id: number) {
        return this.stationService.restore(id);
    }
}
