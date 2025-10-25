import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatMessageService } from './chat-message.service';
import { CreateMessageDto } from './dto/create-message.dto';

@ApiTags('Chat Messages')
@ApiBearerAuth()
@Controller('chat-messages')
export class ChatMessageController {
  constructor(private readonly chatMessageService: ChatMessageService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Gửi tin nhắn đến phòng chat' })
  async createChatRoom(@Req() req, @Body() createMessageDto: CreateMessageDto) {
    const userId = req.user?.id;

    return await this.chatMessageService.createMessage(
      userId,
      createMessageDto,
    );
  }
}
