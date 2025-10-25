import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ChatRoomService } from './chat-room.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleName } from 'src/enums';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat-rooms')
export class ChatRoomController {
  constructor(private readonly chatRoomService: ChatRoomService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.STAFF)
  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách chat tự động lấy mới nhất',
    description: 'STAFF',
  })
  async findAll() {
    return await this.chatRoomService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-userId')
  @ApiOperation({
    summary: 'Lấy chi tiết phòng theo userid',
  })
  async findByUserId(@Req() req) {
    const userId = req.user?.id;

    return await this.chatRoomService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết phòng chat kèm message',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID phòng chat' })
  async findById(@Param('id') id: number) {
    return await this.chatRoomService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Tạo phòng chat mới' })
  async createChatRoom(@Req() req) {
    const userId = req.user?.id;

    return await this.chatRoomService.createChatRoom(userId);
  }
}
