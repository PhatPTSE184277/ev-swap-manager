import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities';
import { ChatRoom } from 'src/entities/chat-room.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatroomRepository: Repository<ChatRoom>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<any> {
    try {
      const chatRooms = await this.chatroomRepository.find({
        relations: ['messages', 'user', 'supporter'],
        select: {
          id: true,
          name: true,
          createdBy: true,
          createdAt: true,
          updatedAt: true,
          user: { username: true, fullName: true, avatar: true },
          supporter: { username: true, fullName: true, avatar: true },
          messages: { content: true, createdAt: true },
        },
        order: {
          messages: { createdAt: 'ASC' },
        },
      });

      // get last message
      const result = chatRooms.map((room) => ({
        ...room,
        lastMessage: room.messages?.[room.messages.length - 1] || null,
        messages: undefined,
      }));

      // sort by last message time
      result.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt
          ? new Date(a.lastMessage.createdAt).getTime()
          : 0;
        const bTime = b.lastMessage?.createdAt
          ? new Date(b.lastMessage.createdAt).getTime()
          : 0;
        return bTime - aTime;
      });

      return {
        data: result,
        message: 'Lấy danh sách chat thành công',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Lỗi hệ thống khi lấy danh sách chat',
      );
    }
  }

  async findById(id: number): Promise<any> {
    try {
      const chatroom = await this.chatroomRepository.findOne({
        where: { id },
        relations: ['messages', 'supporter'],
        select: {
          supporter: { username: true, fullName: true, avatar: true },
        },
      });

      if (!chatroom) {
        throw new NotFoundException('Phòng chat không tồn tại');
      }

      return {
        data: chatroom,
        message: 'Lấy chi tiết chat thành công',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Lỗi hệ thống khi lấy chi tiết chat',
      );
    }
  }

  async findByUserId(userId: number): Promise<any> {
    try {
      const chatroom = await this.chatroomRepository.findOne({
        where: { createdBy: userId },
        relations: ['messages', 'supporter'],
        select: {
          supporter: { username: true, fullName: true, avatar: true },
        },
      });

      if (!chatroom) {
        const newChatRoom = await this.createChatRoom(userId);
        console.log('newChatRoom', newChatRoom);
        const getChatRoomById = await this.findById(newChatRoom.data);

        return {
          message: 'Lấy chi tiết chat thành công',
          data: getChatRoomById,
        };
      }

      return {
        data: chatroom,
        message: 'Lấy chi tiết chat thành công',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Lỗi hệ thống khi lấy chi tiết chat',
      );
    }
  }

  // prm
  async findByUserIdPRM(userId: number): Promise<any> {
    try {
      // Tìm phòng chat của user
      const chatroom = await this.chatroomRepository.findOne({
        where: { createdBy: userId },
        relations: ['messages'], // chỉ cần messages thôi
      });

      // Nếu chưa có thì tạo mới
      if (!chatroom) {
        const newChatRoom = await this.createChatRoomPRM(userId);
        const getChatRoomById = await this.findById(newChatRoom.data);

        return {
          message: 'Lấy chi tiết chat thành công',
          data: getChatRoomById,
        };
      }

      return {
        data: chatroom,
        message: 'Lấy chi tiết chat thành công',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Lỗi hệ thống khi lấy chi tiết chat',
      );
    }
  }

  async createChatRoomPRM(userId: number): Promise<any> {
    try {
      const newChatRoom = await this.chatroomRepository.save({
        name: `Phòng chat ${userId}`,
        createdBy: userId,
      });

      return {
        data: newChatRoom.id,
        message: 'Tạo phòng chat thành công',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Lỗi hệ thống khi tạo phòng chat',
      );
    }
  }

  async findByIdPRM(id: number): Promise<any> {
    try {
      const chatroom = await this.chatroomRepository.findOne({
        where: { id },
        relations: ['messages'],
      });

      if (!chatroom) {
        throw new NotFoundException('Phòng chat không tồn tại');
      }

      return {
        data: chatroom,
        message: 'Lấy chi tiết chat thành công',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Lỗi hệ thống khi lấy chi tiết chat',
      );
    }
  }
  // end prm

  async createChatRoom(userId: number): Promise<any> {
    try {
      const user = await this.dataSource
        .getRepository(User)
        .findOne({ where: { id: userId } });

      const newChatRoom = await this.chatroomRepository.save({
        name: `Phòng chat ${user?.fullName || user?.username} - ${userId}`,
        createdBy: userId,
      });

      return {
        data: newChatRoom.id,
        message: 'Tạo phòng chat thành công',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Lỗi hệ thống khi tạo phòng chat',
      );
    }
  }

  async staffStartChat(userId: number, roomId: number): Promise<any> {
    try {
      const user = await this.dataSource
        .getRepository(User)
        .findOne({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException('Người dùng không tồn tại');
      }

      const chatRoomTest = await this.chatroomRepository.findOne({
        where: { id: roomId },
      });

      const updateChatRoom = await this.chatroomRepository.update(
        { id: roomId },
        { supporterId: userId },
      );

      const chatRoom = await this.chatroomRepository.findOne({
        where: { id: roomId },
      });
      return {
        data: chatRoom,
        message: 'Vào phòng thành công',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Lỗi hệ thống khi tạo phòng chat',
      );
    }
  }
}
