import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
    InternalServerErrorException
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/entities';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { MailService } from '../mail/mail.service';
import { UserStatus } from 'src/enums';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService
    ) {}

    async validateUser(
        usernameOrEmail: string,
        password: string
    ): Promise<User | null> {
        try {
            const user =
                await this.userService.findUserByUserNameOrEmail(usernameOrEmail);

            if (!user) {
                return null;
            }

            if (user.status !== UserStatus.VERIFIED) {
                throw new UnauthorizedException(
                    'Vui lòng xác thực email trước khi đăng nhập'
                );
            }

            if (bcrypt.compareSync(password, user.password)) {
                return user;
            }
            return null;
        } catch (error) {
            if (error instanceof UnauthorizedException) throw error;
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi xác thực người dùng');
        }
    }

    login(user: User) {
        try {
            const payload = {
                sub: user.id,
                username: user.username,
                role: user.role?.name || null
            };
            return {
                access_token: this.jwtService.sign(payload),
                message: 'Đăng nhập thành công'
            };
        } catch (error) {
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi đăng nhập');
        }
    }

    async register(createUserDto: CreateUserDto) {
        try {
            const user = await this.userService.createUser(createUserDto);

            if (!user.emailVerificationToken) {
                throw new BadRequestException('Lỗi tạo token xác thực email');
            }

            await this.mailService.sendEmailVerification(
                user.email,
                user.emailVerificationToken,
                user.username
            );

            return {
                message:
                    'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
                email: user.email
            };
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi đăng ký');
        }
    }

    async verifyEmail(token: string) {
        try {
            await this.userService.verifyEmail(token);
            return {
                message: 'Xác thực email thành công! Bây giờ bạn có thể đăng nhập.'
            };
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi xác thực email');
        }
    }

    async forgotPassword(email: string) {
        try {
            const user = await this.userService.generateResetPasswordToken(email);

            if (!user.resetPasswordToken) {
                throw new BadRequestException('Lỗi tạo token đặt lại mật khẩu');
            }

            await this.mailService.sendPasswordReset(
                user.email,
                user.resetPasswordToken,
                user.username
            );

            return { message: 'Email đặt lại mật khẩu đã được gửi!' };
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi gửi email đặt lại mật khẩu');
        }
    }

    async resetPassword(token: string, newPassword: string) {
        try {
            await this.userService.resetPassword(token, newPassword);
            return { message: 'Đặt lại mật khẩu thành công!' };
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi đặt lại mật khẩu');
        }
    }

    async resendVerification(email: string) {
        try {
            const user = await this.userService.findUserByUserNameOrEmail(email);
            if (!user) {
                throw new UnauthorizedException('Email không tồn tại');
            }

            if (user.status === UserStatus.VERIFIED) {
                throw new UnauthorizedException('Email đã được xác thực');
            }

            if (!user.emailVerificationToken) {
                throw new BadRequestException('Token xác thực không tồn tại');
            }

            await this.mailService.sendEmailVerification(
                user.email,
                user.emailVerificationToken,
                user.username
            );

            return { message: 'Email xác thực đã được gửi lại!' };
        } catch (error) {
            if (error instanceof UnauthorizedException || error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi gửi lại email xác thực');
        }
    }
}