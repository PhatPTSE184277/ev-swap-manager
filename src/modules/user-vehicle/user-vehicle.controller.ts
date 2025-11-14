import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards
} from '@nestjs/common';
import { UserVehicleService } from './user-vehicle.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleName } from 'src/enums/role.enum';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags
} from '@nestjs/swagger';
import { CreateUserVehicleDto } from './dto/create-user-vehicle.dto';
import { UpdateUserVehicleDto } from './dto/update-user-vehicle.dto';

@ApiTags('UserVehicle')
@ApiBearerAuth()
@Controller('user-vehicle')
export class UserVehicleController {
    constructor(private readonly userVehicleService: UserVehicleService) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.USER, RoleName.ADMIN)
    @Get('by-user')
    @ApiOperation({
        summary: 'Lấy danh sách xe của user (chỉ xe đang hoạt động)',
        description: 'User chỉ xem được xe của chính mình.'
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
    async findAllByUser(
        @Req() req,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('order') order: 'ASC' | 'DESC' = 'ASC'
    ) {
        const userId = req.user.id;
        return this.userVehicleService.findAllByUser(
            userId,
            page,
            limit,
            search,
            order
        );
    }
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.STAFF, RoleName.ADMIN)
    @Post('staff')
    @ApiOperation({
        summary: 'Staff tạo phương tiện cho user',
        description:
            'Nhân viên tạo phương tiện cho user khác (bằng email hoặc username) và gán đúng 2 cục pin cho xe. Pin phải phù hợp loại xe.'
    })
    @ApiBody({
        type: CreateUserVehicleDto,
        examples: {
            example: {
                summary: 'Tạo xe với 2 pin',
                value: {
                    userNameOrEmail: 'user@email.com',
                    vehicleTypeId: 1,
                    name: 'Xe máy điện ABC',
                    batteries: [{ batteryId: 101 }, { batteryId: 102 }]
                }
            }
        }
    })
    async staffCreate(@Body() createUserVehicleDto: CreateUserVehicleDto) {
        return this.userVehicleService.staffCreateUserVehicle(
            createUserVehicleDto
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.USER, RoleName.ADMIN)
    @Patch(':id')
    @ApiOperation({
        summary: 'Cập nhật thông tin phương tiện',
        description: 'User chỉ cập nhật được phương tiện của chính mình'
    })
    @ApiParam({ name: 'id', type: Number, description: 'ID phương tiện' })
    async update(
        @Req() req,
        @Param('id') id: number,
        @Body() updateUserVehicleDto: UpdateUserVehicleDto
    ) {
        const userId = req.user.id;
        return this.userVehicleService.update(userId, id, updateUserVehicleDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.USER, RoleName.ADMIN)
    @Delete(':id')
    @ApiOperation({
        summary: 'Xóa mềm phương tiện',
        description: 'User chỉ xóa được phương tiện của chính mình'
    })
    @ApiParam({ name: 'id', type: Number, description: 'ID phương tiện' })
    async softDelete(@Req() req, @Param('id') id: number) {
        const userId = req.user.id;
        return this.userVehicleService.softDelete(userId, id);
    }
}
