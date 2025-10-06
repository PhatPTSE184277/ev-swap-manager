import {
    BadRequestException,
    Injectable,
    NotFoundException,
    InternalServerErrorException
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
        try {
            const user = await this.userRepository.findOne({
                where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
                relations: ['role']
            });
            return user ?? undefined;
        } catch (error) {
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi tìm kiếm người dùng');
        }
    }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        try {
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
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi tạo người dùng');
        }
    }

    async findByIdForAuth(id: number): Promise<any> {
        try {
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
        } catch (error) {
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi lấy thông tin người dùng');
        }
    }

    async findById(id: number): Promise<{ data: any; message: string }> {
        try {
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
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi lấy thông tin người dùng');
        }
    }

    async findByEmailVerificationToken(
        token: string
    ): Promise<User | undefined> {
        try {
            const user = await this.userRepository.findOne({
                where: {
                    emailVerificationToken: token
                }
            });
            return user ?? undefined;
        } catch (error) {
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi tìm kiếm token xác thực email');
        }
    }

    async findByResetPasswordToken(token: string): Promise<User | undefined> {
        try {
            const user = await this.userRepository.findOne({
                where: {
                    resetPasswordToken: token
                }
            });
            return user ?? undefined;
        } catch (error) {
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi tìm kiếm token reset mật khẩu');
        }
    }

    async verifyEmail(token: string): Promise<boolean> {
        try {
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
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi xác thực email');
        }
    }

    async resendVerification(email: string): Promise<User> {
        try {
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
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi gửi lại mã xác thực');
        }
    }

    async generateResetPasswordToken(email: string): Promise<User> {
        try {
            const user = await this.findUserByUserNameOrEmail(email);
            if (!user) {
                throw new BadRequestException('Email không tồn tại');
            }

            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

            user.resetPasswordToken = resetToken;
            user.resetPasswordExpire = resetExpire;

            return await this.userRepository.save(user);
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi tạo token reset mật khẩu');
        }
    }

    async resetPassword(token: string, newPassword: string): Promise<boolean> {
        try {
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
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi đặt lại mật khẩu');
        }
    }

    async updateProfile(
        id: number,
        updateUserDto: UpdateUserDto
    ): Promise<{ message: string }> {
        try {
            const user = await this.userRepository.findOne({ where: { id } });
            if (!user) {
                throw new NotFoundException('User not found');
            }

            Object.assign(user, updateUserDto);
            await this.userRepository.save(user);
            return { message: 'Cập nhật thông tin thành công' };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi cập nhật thông tin');
        }
    }

    async changePassword(
        id: number,
        changePasswordDto: ChangePasswordDto
    ): Promise<{ message: string }> {
        try {
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
            if (changePasswordDto.currentPassword === changePasswordDto.newPassword) {
                throw new BadRequestException('Mật khẩu mới phải khác mật khẩu hiện tại');
            }
            const hashedPassword = await bcrypt.hash(
                changePasswordDto.newPassword,
                10
            );
            user.password = hashedPassword;
            await this.userRepository.save(user);
            return { message: 'Đổi mật khẩu thành công' };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi đổi mật khẩu');
        }
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
        try {
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
        } catch (error) {
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi lấy danh sách người dùng');
        }
    }

    async softDeleteUser(id: number): Promise<{ message: string }> {
        try {
            const user = await this.userRepository.findOne({ where: { id } });
            if (!user) {
                throw new NotFoundException('Không tìm thấy người dùng');
            }
            if (user.status === UserStatus.INACTIVE) {
                throw new BadRequestException('Người dùng đã bị xóa trước đó');
            }
            user.status = UserStatus.INACTIVE;
            await this.userRepository.save(user);
            return { message: 'Xóa người dùng thành công' };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi xóa người dùng');
        }
    }

    async restoreUser(id: number): Promise<{ message: string }> {
        try {
            const user = await this.userRepository.findOne({ where: { id } });
            if (!user) {
                throw new NotFoundException('Không tìm thấy người dùng');
            }
            if (user.status !== UserStatus.INACTIVE) {
                throw new BadRequestException('Người dùng không ở trạng thái bị xóa');
            }
            user.status = UserStatus.VERIFIED;
            await this.userRepository.save(user);
            return { message: 'Khôi phục người dùng thành công' };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi khôi phục người dùng');
        }
    }
}