import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiTags,
    ApiQuery,
    ApiParam
} from '@nestjs/swagger';
import { CreateFeedbackDto } from './dto/create-feedback';
import { UpdateFeedbackDto } from './dto/update-feedback';

@ApiTags('Feedback')
@ApiBearerAuth()
@Controller('feedback')
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiOperation({
        summary: 'User gửi feedback cho trạm',
        description: 'Chỉ gửi được nếu đã có booking hoàn thành tại trạm, mỗi user chỉ feedback 1 lần cho mỗi trạm'
    })
    async createFeedback(
        @Req() req,
        @Body() dto: CreateFeedbackDto
    ) {
        const userId = req.user.id;
        return this.feedbackService.createFeedback(userId, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    @ApiOperation({
        summary: 'User cập nhật feedback của mình',
        description: 'Chỉ được sửa feedback của chính mình'
    })
    @ApiParam({ name: 'id', type: Number, description: 'ID feedback' })
    async updateFeedback(
        @Req() req,
        @Param('id') feedbackId: number,
        @Body() dto: UpdateFeedbackDto
    ) {
        const userId = req.user.id;
        return this.feedbackService.updateFeedback(feedbackId, userId, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('my')
    @ApiOperation({
        summary: 'Lấy danh sách feedback của user',
        description: 'Phân trang, tìm kiếm, lọc theo trạm'
    })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Trang hiện tại' })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Số lượng mỗi trang' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Tìm kiếm theo nội dung feedback' })
    @ApiQuery({ name: 'stationId', required: false, type: Number, description: 'Lọc theo trạm' })
    async getFeedbacksByUser(
        @Req() req,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('stationId') stationId?: number
    ) {
        const userId = req.user.id;
        return this.feedbackService.getFeedbacksByUser(userId, page, limit, search, stationId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('station/:stationId')
    @ApiOperation({
        summary: 'Lấy danh sách feedback của trạm',
        description: 'Phân trang, tìm kiếm'
    })
    @ApiParam({ name: 'stationId', type: Number, description: 'ID trạm' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Trang hiện tại' })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Số lượng mỗi trang' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Tìm kiếm theo nội dung feedback' })
    async getFeedbacksByStation(
        @Param('stationId') stationId: number,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string
    ) {
        return this.feedbackService.getFeedbacksByStation(stationId, page, limit, search);
    }
}