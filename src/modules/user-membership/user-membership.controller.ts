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
import { UserMembershipService } from './user-membership.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags
} from '@nestjs/swagger';
import { CreateUserMembershipDto } from './dto/create-user-membership.dto';
import { UserMembershipStatus } from '../../enums';
import { UpgradeUserMembershipDto } from './dto/upgrade-user-membership.dto';

@ApiTags('UserMembership')
@ApiBearerAuth()
@Controller('user-membership')
export class UserMembershipController {
    constructor(
        private readonly userMembershipService: UserMembershipService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Get('by-user')
    @ApiOperation({
        summary: 'Lấy danh sách gói thành viên của user',
        description: 'User xem được tất cả gói đã/đang đăng ký của mình.'
    })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: UserMembershipStatus,
        example: UserMembershipStatus.ACTIVE
    })
    async getAllByUser(
        @Req() req,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('status') status?: UserMembershipStatus
    ) {
        const userId = req.user.id;
        return this.userMembershipService.getAllByUser(
            userId,
            page,
            limit,
            search,
            status
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiOperation({
        summary: 'User đăng ký/mua gói thành viên mới',
        description: 'User tự đăng ký gói thành viên cho chính mình'
    })
    async create(
        @Req() req,
        @Body() createUserMembershipDto: CreateUserMembershipDto
    ) {
        const userId = req.user.id;
        return this.userMembershipService.create(
            userId,
            createUserMembershipDto
        );
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/cancel')
    @ApiOperation({
        summary: 'User hủy gói thành viên đang hoạt động',
        description: 'User có thể hủy gói thành viên đang hoạt động của mình'
    })
    @ApiParam({
        name: 'id',
        required: true,
        type: Number,
        description: 'ID của UserMembership'
    })
    async cancelActiveMembership(
        @Req() req,
        @Param('id') userMembershipId: number
    ) {
        const userId = req.user.id;
        return this.userMembershipService.cancelActiveMemberships(
            userId,
            Number(userMembershipId)
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post('upgrade')
    @ApiOperation({
        summary: 'User nâng cấp gói thành viên',
        description:
            'User nâng cấp lên gói thành viên cao hơn, được giảm giá theo số lượt swap còn lại'
    })
    async upgradeUserMembership(
        @Req() req,
        @Body() upgradeUserMembershipDto: UpgradeUserMembershipDto
    ) {
        const userId = req.user.id;
        return this.userMembershipService.upgradeUserMembership(
            userId,
            upgradeUserMembershipDto
        );
    }
}
