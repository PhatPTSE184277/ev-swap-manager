import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
    Delete
} from '@nestjs/common';
import { VehicleTypeService } from './vehicle-type.service';
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
import { CreateVehicleTypeDto } from './dto/create-vehicle-type.dto';
import { UpdateVehicleTypeDto } from './dto/update-vehicle-type.dto';

@ApiTags('VehicleType')
@ApiBearerAuth()
@Controller('vehicle-type')
export class VehicleTypeController {
    constructor(private readonly vehicleTypeService: VehicleTypeService) {}

    @Get('public')
    @ApiOperation({
        summary: 'Lấy danh sách loại xe cho user (chỉ loại xe đang hoạt động)',
        description: 'Ai cũng gọi được, chỉ trả về loại xe có status=true'
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
        return this.vehicleTypeService.findAllPublic(
            page,
            limit,
            search,
            order
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Get()
    @ApiOperation({
        summary: 'Lấy danh sách loại xe (phân trang, filter, search)',
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
        description: 'Tìm kiếm theo model xe'
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
        return this.vehicleTypeService.findAll(
            page,
            limit,
            search,
            order,
            status
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Get(':id')
    @ApiOperation({
        summary: 'Lấy chi tiết loại xe',
        description: 'Chỉ ADMIN'
    })
    @ApiParam({ name: 'id', type: Number, description: 'ID loại xe' })
    async findById(@Param('id') id: number) {
        return this.vehicleTypeService.findById(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Post()
    @ApiOperation({ summary: 'Tạo mới loại xe', description: 'Chỉ ADMIN' })
    async create(@Body() createVehicleTypeDto: CreateVehicleTypeDto) {
        return this.vehicleTypeService.create(createVehicleTypeDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật loại xe', description: 'Chỉ ADMIN' })
    @ApiParam({ name: 'id', type: Number, description: 'ID loại xe' })
    async update(
        @Param('id') id: number,
        @Body() updateVehicleTypeDto: UpdateVehicleTypeDto
    ) {
        return this.vehicleTypeService.update(id, updateVehicleTypeDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Delete(':id')
    @ApiOperation({ summary: 'Xóa mềm loại xe', description: 'Chỉ ADMIN' })
    @ApiParam({ name: 'id', type: Number, description: 'ID loại xe' })
    async softDelete(@Param('id') id: number) {
        return this.vehicleTypeService.softDelete(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Patch('restore/:id')
    @ApiOperation({ summary: 'Khôi phục loại xe', description: 'Chỉ ADMIN' })
    @ApiParam({ name: 'id', type: Number, description: 'ID loại xe' })
    async restore(@Param('id') id: number) {
        return this.vehicleTypeService.restore(id);
    }
}