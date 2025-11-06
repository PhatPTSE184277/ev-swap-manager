import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CleanupService } from './cleanup.service';
import { ChatRoom } from 'src/entities/chat-room.entity';
import { ChatMessage } from 'src/entities/chat-message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessage, ChatRoom])],
  providers: [CleanupService],
})
export class CleanupModule {}
