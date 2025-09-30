import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}

    async login(loginDto: LoginDto): Promise<User> {
        const { account, password } = loginDto;

        const user = await this.userRepository.findOne({
            where: account.includes('@')
                ? { email: account }
                : { userName: account }
        });

        if (!user) {
            throw new UnauthorizedException('')
        }

        const isPasswordValid = await b
    }
}
