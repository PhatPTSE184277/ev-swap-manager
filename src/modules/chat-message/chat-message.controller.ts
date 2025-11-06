import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatMessageService } from './chat-message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateMessagePRMDto } from './dto/create-message-prm.dto';

@ApiTags('Chat Messages')
@ApiBearerAuth()
@Controller('chat-messages')
export class ChatMessageController {
  constructor(private readonly chatMessageService: ChatMessageService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Gửi tin nhắn đến phòng chat' })
  async createChatMessage(
    @Req() req,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    const userId = req.user?.id;

    return await this.chatMessageService.createMessage(
      userId,
      createMessageDto,
    );
  }

  //prm
  @Post('prm')
  @ApiOperation({ summary: 'Gửi tin nhắn đến phòng chat' })
  async createChatMessagePRM(@Body() createMessageDto: CreateMessagePRMDto) {
    return await this.chatMessageService.createMessagePRM(createMessageDto);
  }
}
