import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async findAll(): Promise<{data?: User[], message: string}> {
        const users = await this.userRepository.find({
            where: { status: true },
            order: { createdAt: 'DESC' },
        });

        if (!users || users.length === 0) {
            return { message: 'Không có người dùng nào' };
        }
        
        return { data: users, message: 'Người dùng đã được lấy thành công' };
    }
}
