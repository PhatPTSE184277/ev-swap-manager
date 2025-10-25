import { Module } from '@nestjs/common';
import { ChatGateway } from 'src/gateways/chat.gateway';
import { ChatRoom } from 'src/entities/chat-room.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from 'src/entities/chat-message.entity';
import { ChatMessageController } from './chat-message.controller';
import { ChatMessageService } from './chat-message.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChatRoom, ChatMessage])],
  providers: [ChatGateway, ChatMessageService],
  controllers: [ChatMessageController],
  exports: [],
})
export class ChatMessageModule {}
