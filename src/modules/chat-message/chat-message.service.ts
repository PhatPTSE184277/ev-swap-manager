import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities';
import { ChatMessage } from 'src/entities/chat-message.entity';
import { ChatRoom } from 'src/entities/chat-room.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { ChatGateway } from 'src/gateways/chat.gateway';

@Injectable()
export class ChatMessageService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    private readonly dataSource: DataSource,
    private readonly chatGateway: ChatGateway,
  ) {}

  async createMessage(
    userId: number,
    createMessageDto: CreateMessageDto,
  ): Promise<any> {
    try {
      const { content, roomId } = createMessageDto;

      if (!content) {
        throw new NotFoundException('Thiếu thông nội dung');
      }

      const chatRoom = await this.dataSource
        .getRepository(ChatRoom)
        .findOne({ where: { id: roomId } });

      if (!chatRoom) {
        throw new NotFoundException('Phòng chat không tồn tại');
      }

      const chatMessage = await this.chatMessageRepository.save({
        senderId: userId,
        roomId: roomId,
        content: content,
      });

      // socket send to everyone in room
      this.chatGateway.server
        .to(`room_${roomId}`)
        .emit('receiveMessage', chatMessage);

      return {
        data: chatMessage,
        message: 'Tin nhắn đã được gửi thành công',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Lỗi hệ thống xảy ra khi tạo booking',
      );
    }
  }
}
