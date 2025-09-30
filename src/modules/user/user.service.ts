import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UserStatus } from 'src/enums';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>
    ) {}

    async findUserByUserNameOrEmail(usernameOrEmail: string): Promise<User | undefined> {
        const user = await this.userRepository.findOne({
            where: [
                { userName: usernameOrEmail },
                { email: usernameOrEmail }
            ]
        });
        return user ?? undefined;
    }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const existingUser = await this.findUserByUserNameOrEmail(createUserDto.userName);
        if (existingUser) {
            throw new BadRequestException('Tên đăng nhập đã tồn tại');
        }

        const existingEmail = await this.findUserByUserNameOrEmail(createUserDto.email);
        if (existingEmail) {
            throw new BadRequestException('Email đã tồn tại');
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        const emailVerificationExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        
        const user = this.userRepository.create({
            ...createUserDto,
            password: hashedPassword,
            roleId: 2,
            status: UserStatus.PENDING_VERIFICATION,
            emailVerificationToken,
            emailVerificationExpire
        });

        return await this.userRepository.save(user);
    }

    async findById(id: number): Promise<User | undefined> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['role']
        });
        return user ?? undefined;
    }

    async findByEmailVerificationToken(token: string): Promise<User | undefined> {
        const user = await this.userRepository.findOne({
            where: { 
                emailVerificationToken: token,
            }
        });
        return user ?? undefined;
    }

    async findByResetPasswordToken(token: string): Promise<User | undefined> {
        const user = await this.userRepository.findOne({
            where: { 
                resetPasswordToken: token,
            }
        });
        return user ?? undefined;
    }

    async verifyEmail(token: string): Promise<boolean> {
        const user = await this.findByEmailVerificationToken(token);
        
        if (!user || !user.emailVerificationExpire || user.emailVerificationExpire < new Date()) {
            throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
        }

        user.status = UserStatus.VERIFIED;
        user.emailVerificationToken = null;
        user.emailVerificationExpire = null;
        
        await this.userRepository.save(user);
        return true;
    }

   async resendVerification(email: string): Promise<User> {
    const user = await this.findUserByUserNameOrEmail(email);
    if (!user) {
        throw new BadRequestException('Email không tồn tại');
    }

    if (user.status === UserStatus.VERIFIED) {
        throw new BadRequestException('Email đã được xác thực');
    }

    if (
        !user.emailVerificationToken ||
        !user.emailVerificationExpire ||
        user.emailVerificationExpire < new Date()
    ) {
        user.emailVerificationToken = crypto.randomBytes(32).toString('hex');
        user.emailVerificationExpire = new Date(Date.now() + 60 * 60 * 1000);
        await this.userRepository.save(user);
    }

    return user;
}
    async generateResetPasswordToken(email: string): Promise<User> {
        const user = await this.findUserByUserNameOrEmail(email);
        if (!user) {
            throw new BadRequestException('Email không tồn tại');
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = resetExpire;
        
        return await this.userRepository.save(user);
    }

    async resetPassword(token: string, newPassword: string): Promise<boolean> {
        const user = await this.findByResetPasswordToken(token);
        
        if (!user || !user.resetPasswordExpire || user.resetPasswordExpire < new Date()) {
            throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;
        
        await this.userRepository.save(user);
        return true;
    }
}