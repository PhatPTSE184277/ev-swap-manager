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
import { SlotService } from './slot.service';
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
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';

@ApiTags('Slot')
@ApiBearerAuth()
@Controller('slot')
export class SlotController {
    constructor(private readonly slotService: SlotService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    @ApiOperation({
        summary: 'Lấy danh sách slot (phân trang, filter, search)',
        description: 'ADMIN'
    })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({
        name: 'order',
        required: false,
        enum: ['ASC', 'DESC'],
        example: 'DESC'
    })
    @ApiQuery({
        name: 'cabinetId',
        required: false,
        type: Number,
        description: 'Lọc theo tủ'
    })
    @ApiQuery({
        name: 'status',
        required: false,
        type: String,
        description: 'Lọc theo trạng thái slot'
    })
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('order') order: 'ASC' | 'DESC' = 'DESC',
        @Query('cabinetId') cabinetId?: number,
        @Query('status') status?: string
    ) {
        return this.slotService.findAll(page, limit, search, order, status, cabinetId);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Lấy chi tiết slot',
    })
    @ApiParam({ name: 'id', type: Number, description: 'ID slot' })
    async findById(@Param('id') id: number) {
        return this.slotService.findById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiOperation({ summary: 'Tạo mới slot', description: 'Chỉ ADMIN' })
    async create(@Body() createSlotDto: CreateSlotDto) {
        return this.slotService.create(createSlotDto);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật slot', description: 'Chỉ ADMIN' })
    @ApiParam({ name: 'id', type: Number, description: 'ID slot' })
    async update(
        @Param('id') id: number,
        @Body() updateSlotDto: UpdateSlotDto
    ) {
        return this.slotService.update(id, updateSlotDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @ApiOperation({ summary: 'Xóa mềm slot', description: 'Chỉ ADMIN' })
    @ApiParam({ name: 'id', type: Number, description: 'ID slot' })
    async softDelete(@Param('id') id: number) {
        return this.slotService.softDelete(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('restore/:id')
    @ApiOperation({ summary: 'Khôi phục slot', description: 'Chỉ ADMIN' })
    @ApiParam({ name: 'id', type: Number, description: 'ID slot' })
    async restore(@Param('id') id: number) {
        return this.slotService.restore(id);
    }
}