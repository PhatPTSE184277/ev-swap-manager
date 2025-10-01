import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities';
import { Like, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UserStatus } from 'src/enums';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>
    ) {}

    async findUserByUserNameOrEmail(
        usernameOrEmail: string
    ): Promise<User | undefined> {
        const user = await this.userRepository.findOne({
            where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
            relations: ['role']
        });
        return user ?? undefined;
    }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const existingUser = await this.findUserByUserNameOrEmail(
            createUserDto.username
        );
        if (existingUser) {
            throw new BadRequestException('Tên đăng nhập đã tồn tại');
        }

        const existingEmail = await this.findUserByUserNameOrEmail(
            createUserDto.email
        );
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

    async findByIdForAuth(id: number): Promise<any> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['role']
        });
        if (!user) return null;

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            avatar: user.avatar,
            status: user.status,
            role: user.role?.name || null
        };
    }

    async findById(id: number): Promise<{ data: any; message: string }> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['role']
        });
        if (!user) {
            throw new NotFoundException('Người dùng không tồn tại');
        }
        const {
            password,
            resetPasswordToken,
            resetPasswordExpire,
            emailVerificationToken,
            emailVerificationExpire,
            otp,
            expireOtp,
            roleId,
            status,
            createdAt,
            updatedAt,
            ...result
        } = user;
        return {
            data: {
                ...result,
                role: user.role?.name || null
            },
            message: 'Lấy thông tin người dùng thành công'
        };
    }

    async findByEmailVerificationToken(
        token: string
    ): Promise<User | undefined> {
        const user = await this.userRepository.findOne({
            where: {
                emailVerificationToken: token
            }
        });
        return user ?? undefined;
    }

    async findByResetPasswordToken(token: string): Promise<User | undefined> {
        const user = await this.userRepository.findOne({
            where: {
                resetPasswordToken: token
            }
        });
        return user ?? undefined;
    }

    async verifyEmail(token: string): Promise<boolean> {
        const user = await this.findByEmailVerificationToken(token);

        if (
            !user ||
            !user.emailVerificationExpire ||
            user.emailVerificationExpire < new Date()
        ) {
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
            user.emailVerificationToken = crypto
                .randomBytes(32)
                .toString('hex');
            user.emailVerificationExpire = new Date(
                Date.now() + 60 * 60 * 1000
            );
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

        if (
            !user ||
            !user.resetPasswordExpire ||
            user.resetPasswordExpire < new Date()
        ) {
            throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;

        await this.userRepository.save(user);
        return true;
    }

    async updateProfile(
        id: number,
        updateProfileDto: UpdateUserDto
    ): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        Object.assign(user, updateProfileDto);
        await this.userRepository.save(user);
        return { message: 'Cập nhật thông tin thành công' };
    }

    async changePassword(
        id: number,
        changePasswordDto: ChangePasswordDto
    ): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('Người dùng không tồn tại');
        }
        const isMatch = await bcrypt.compare(
            changePasswordDto.currentPassword,
            user.password
        );
        if (!isMatch) {
            throw new BadRequestException('Mật khẩu hiện tại không chính xác');
        }
        const hashedPassword = await bcrypt.hash(
            changePasswordDto.newPassword,
            10
        );
        user.password = hashedPassword;
        await this.userRepository.save(user);
        return { message: 'Đổi mật khẩu thành công' };
    }

    async getAllUsers(
        page: number = 1,
        limit: number = 10,
        search?: string,
        status?: string,
        role?: string,
        order: 'ASC' | 'DESC' = 'DESC'
    ): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        message: string;
    }> {
        const where: any = {};

        if (status) where.status = status;
        if (role) where.role = { name: role };

        let whereCondition: any = where;
        if (search) {
            whereCondition = [
                { ...where, username: Like(`%${search}%`) },
                { ...where, email: Like(`%${search}%`) },
                { ...where, fullName: Like(`%${search}%`) }
            ];
        }

        const [users, total] = await this.userRepository.findAndCount({
            where: whereCondition,
            relations: ['role'],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: order }
        });

        const result = users.map((user) => {
            const {
                password,
                resetPasswordToken,
                resetPasswordExpire,
                emailVerificationToken,
                emailVerificationExpire,
                otp,
                roleId,
                expireOtp,
                createdAt,
                updatedAt,
                ...rest
            } = user;
            return {
                ...rest,
                role: user.role?.name || null
            };
        });

        return {
            data: result,
            total,
            page,
            limit,
            message: 'Lấy danh sách người dùng thành công'
        };
    }

    async softDeleteUser(id: number): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        user.status = UserStatus.INACTIVE;
        await this.userRepository.save(user);
        return { message: 'Xóa người dùng thành công' };
    }

    async restoreUser(id: number): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        user.status = UserStatus.VERIFIED;
        await this.userRepository.save(user);
        return { message: 'Khôi phục người dùng thành công' };
    }
}
