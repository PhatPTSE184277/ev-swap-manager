import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatMessage } from 'src/entities/chat-message.entity';
import { ChatRoom } from 'src/entities/chat-room.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    @InjectRepository(ChatMessage)
    private chatMsgRepo: Repository<ChatMessage>,
    @InjectRepository(ChatRoom)
    private chatRoomRepo: Repository<ChatRoom>,
  ) {}

  // Chạy mỗi ngày lúc 00:00
  @Cron(CronExpression.EVERY_DAY_AT_10PM)
  async handleCleanup() {
    this.logger.log('start delete chat room, message...');

    await this.chatMsgRepo
      .createQueryBuilder()
      .delete()
      .where('createdAt < NOW() - INTERVAL 1 DAY')
      .execute();

    await this.chatRoomRepo
      .createQueryBuilder()
      .delete()
      .where('createdAt < NOW() - INTERVAL 1 DAY')
      .execute();

    this.logger.log('done delete chat room, message');
  }
}
