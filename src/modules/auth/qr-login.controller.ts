import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
} from '@nestjs/common';
import { QrLoginService } from './qr-login.service';
import { ApproveQrDto } from './dto/approve-qr.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth QR')
@Controller('auth/qr')
export class QrLoginController {
  constructor(private readonly qrLoginService: QrLoginService) {}

  @Post('create')
  @ApiOperation({
    summary: 'Tạo session để hiển thị mã QR (thiết bị chưa login)',
  })
  async create() {
    return this.qrLoginService.createSession();
  }

  @UseGuards(JwtAuthGuard)
  @Post('approve')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve session QR (thiết bị đã login)' })
  async approve(@Body() dto: ApproveQrDto, @Req() req: any) {
    return this.qrLoginService.approve(dto.sessionId, req.user);
  }

  @Get('status/:id')
  @ApiOperation({
    summary: 'Lấy trạng thái QR session',
  })
  async status(@Param('id') id: string) {
    return this.qrLoginService.getStatus(id);
  }
}
