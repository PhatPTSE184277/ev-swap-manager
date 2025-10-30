import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Query,
    Req,
    UseGuards
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
    ApiBearerAuth,
    ApiTags,
    ApiOperation,
    ApiQuery,
    ApiParam
} from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleName, UserStatus } from 'src/enums';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseGuards(JwtAuthGuard)
    @Get('me')
    @ApiOperation({ summary: 'Lấy thông tin cá nhân' })
    async getProfile(@Req() req) {
        return this.userService.findById(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('update-profile')
    @ApiOperation({ summary: 'Cập nhật thông tin cá nhân' })
    async updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.updateProfile(req.user.id, updateUserDto);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('change-password')
    @ApiOperation({ summary: 'Đổi mật khẩu' })
    async changePassword(
        @Req() req,
        @Body() changePasswordDto: ChangePasswordDto
    ) {
        return this.userService.changePassword(req.user.id, changePasswordDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN, RoleName.STAFF)
    @Get()
    @ApiOperation({
        summary: 'Lấy danh sách người dùng (phân trang, filter, search)',
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
        description: 'Tìm kiếm theo username, email, fullName'
    })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: UserStatus,
        description: 'Lọc theo trạng thái user'
    })
    @ApiQuery({
        name: 'role',
        required: false,
        enum: RoleName,
        description: 'Lọc theo vai trò'
    })
    @ApiQuery({
        name: 'order',
        required: false,
        enum: ['ASC', 'DESC'],
        example: 'DESC',
        description: 'Sắp xếp theo ngày tạo (ASC/DESC)'
    })
    async getAllUsers(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('status') status?: UserStatus,
        @Query('role') role?: RoleName,
        @Query('order') order: 'ASC' | 'DESC' = 'DESC'
    ) {
        return this.userService.getAllUsers(
            page,
            limit,
            search,
            status,
            role,
            order
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Delete(':id')
    @ApiOperation({
        summary: 'Xóa mềm người dùng (status -> INACTIVE)',
        description: 'ADMIN'
    })
    @ApiParam({ name: 'id', type: Number, description: 'ID người dùng' })
    async softDeleteUser(@Param('id') id: number) {
        return this.userService.softDeleteUser(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Patch('restore/:id')
    @ApiOperation({
        summary: 'Khôi phục người dùng (status -> VERIFIED)',
        description: 'ADMIN'
    })
    @ApiParam({ name: 'id', type: Number, description: 'ID người dùng' })
    async restoreUser(@Param('id') id: number) {
        return this.userService.restoreUser(id);
    }
}