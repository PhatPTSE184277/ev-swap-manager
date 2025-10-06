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
import { MembershipService } from './membership.service';
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
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';

@ApiTags('Membership')
@ApiBearerAuth()
@Controller('membership')
export class MembershipController {
    constructor(private readonly membershipService: MembershipService) {}

    @Get('public')
    @ApiOperation({
        summary: 'Lấy danh sách gói cho user (chỉ gói đang hoạt động)',
        description: 'Ai cũng gọi được, chỉ trả về gói có status=true'
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
        return this.membershipService.findAllPublic(page, limit, search, order);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Get()
    @ApiOperation({
        summary: 'Lấy danh sách gói (phân trang, filter, search)',
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
        description: 'Tìm kiếm theo tên gói'
    })
    @ApiQuery({
        name: 'order',
        required: false,
        enum: ['ASC', 'DESC'],
        example: 'ASC',
        description: 'Sắp xếp theo tên (ASC/DESC)'
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
        return this.membershipService.findAll(
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
        summary: 'Lấy chi tiết gói',
        description: 'Chỉ ADMIN'
    })
    @ApiParam({ name: 'id', type: Number, description: 'ID gói' })
    async findById(@Param('id') id: number) {
        return this.membershipService.findById(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Post()
    @ApiOperation({ summary: 'Tạo mới gói', description: 'Chỉ ADMIN' })
    async create(@Body() createMembershipDto: CreateMembershipDto) {
        return this.membershipService.create(createMembershipDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật gói', description: 'Chỉ ADMIN' })
    @ApiParam({ name: 'id', type: Number, description: 'ID gói' })
    async update(
        @Param('id') id: number,
        @Body() updateMembershipDto: UpdateMembershipDto
    ) {
        return this.membershipService.update(id, updateMembershipDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Delete(':id')
    @ApiOperation({ summary: 'Xóa mềm gói', description: 'Chỉ ADMIN' })
    @ApiParam({ name: 'id', type: Number, description: 'ID gói' })
    async softDelete(@Param('id') id: number) {
        return this.membershipService.softDelete(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Patch('restore/:id')
    @ApiOperation({ summary: 'Khôi phục gói', description: 'Chỉ ADMIN' })
    @ApiParam({ name: 'id', type: Number, description: 'ID gói' })
    async restore(@Param('id') id: number) {
        return this.membershipService.restore(id);
    }
}
