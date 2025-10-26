import {
    Controller,
    Post,
    Body,
    UseGuards,
    Req,
    Get,
    Param
} from '@nestjs/common';
import { QrLoginService } from './qr-login.service';
import { ApproveQrDto } from './dto/approve-qr.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateSessionDto } from './dto/create-session.dto';

@ApiTags('Auth QR')
@Controller('auth/qr')
export class QrLoginController {
    constructor(private readonly qrLoginService: QrLoginService) {}

    @Post('create')
    @ApiOperation({
        summary: 'Tạo session để hiển thị mã QR (thiết bị chưa login)'
    })
    create(@Body() createSessionDto: CreateSessionDto) {
        return this.qrLoginService.createSession(createSessionDto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('approve')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Approve session QR (thiết bị đã login)' })
    async approve(@Body() dto: ApproveQrDto, @Req() req: any) {
        console.log('🔍 req.user:', req.user);
        console.log('📦 dto:', dto);

        return this.qrLoginService.approve(dto.sessionId, req.user);
    }

    @Get('status/:id')
    @ApiOperation({
        summary: 'Lấy trạng thái QR session'
    })
    status(@Param('id') id: string) {
        return this.qrLoginService.getStatus(id);
    }
}
