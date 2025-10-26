import { Module } from '@nestjs/common';
import { ChatGateway } from 'src/gateways/chat.gateway';
import { ChatRoomController } from './chat-room.controller';
import { ChatRoomService } from './chat-room.service';
import { ChatRoom } from 'src/entities/chat-room.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from 'src/entities/chat-message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatRoom, ChatMessage])],
  providers: [ChatGateway, ChatRoomService],
  controllers: [ChatRoomController],
  exports: [],
})
export class ChatRoomModule {}
