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
import { CabinetService } from './cabinet.service';
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
import { CreateCabinetDto } from './dto/create-cabinet.dto';
import { UpdateCabinetDto } from './dto/update-cabinet.dto';

@ApiTags('Cabinet')
@ApiBearerAuth()
@Controller('cabinet')
export class CabinetController {
    constructor(private readonly cabinetService: CabinetService) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Get()
    @ApiOperation({
        summary: 'Lấy danh sách tủ (phân trang, filter, search)',
        description: 'ADMIN'
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
    @ApiQuery({
        name: 'stationId',
        required: false,
        type: Number,
        description: 'Lọc theo trạm'
    })
    @ApiQuery({
        name: 'status',
        required: false,
        type: Boolean,
        description: 'Lọc theo trạng thái hoạt động của tủ'
    })
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('order') order: 'ASC' | 'DESC' = 'ASC',
        @Query('stationId') stationId?: number,
        @Query('status') status?: boolean
    ) {
        return this.cabinetService.findAll(
            page,
            limit,
            search,
            order,
            stationId,
            status
        );
    }

    @Get('public/by-station/:stationId')
    @ApiOperation({
        summary: 'Lấy danh sách tủ đang hoạt động tại một trạm (cho user)'
    })
    @ApiParam({ name: 'stationId', type: Number, description: 'ID trạm' })
    async findActiveByStation(@Param('stationId') stationId: number) {
        return this.cabinetService.findActiveByStation(stationId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Post()
    @ApiOperation({ summary: 'Tạo mới tủ', description: 'Chỉ ADMIN' })
    async create(@Body() createCabinetDto: CreateCabinetDto) {
        return this.cabinetService.create(createCabinetDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật tủ', description: 'Chỉ ADMIN' })
    @ApiParam({ name: 'id', type: Number, description: 'ID tủ' })
    async update(
        @Param('id') id: number,
        @Body() updateCabinetDto: UpdateCabinetDto
    ) {
        return this.cabinetService.update(id, updateCabinetDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Delete(':id')
    @ApiOperation({ summary: 'Xóa mềm tủ', description: 'Chỉ ADMIN' })
    @ApiParam({ name: 'id', type: Number, description: 'ID tủ' })
    async softDelete(@Param('id') id: number) {
        return this.cabinetService.softDelete(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Patch('restore/:id')
    @ApiOperation({ summary: 'Khôi phục tủ', description: 'Chỉ ADMIN' })
    @ApiParam({ name: 'id', type: Number, description: 'ID tủ' })
    async restore(@Param('id') id: number) {
        return this.cabinetService.restore(id);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Lấy chi tiết tủ',
    })
    @ApiParam({ name: 'id', type: Number, description: 'ID tủ' })
    async findById(@Param('id') id: number) {
        return this.cabinetService.findById(id);
    }
}
