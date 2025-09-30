import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
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
        private readonly mailService: MailService,
    ) {}

    async validateUser(usernameOrEmail: string, password: string): Promise<User | null> {
        const user = await this.userService.findUserByUserNameOrEmail(usernameOrEmail);
        
        if (!user) {
            return null;
        }

        if (user.status !== UserStatus.VERIFIED) {
            throw new UnauthorizedException('Vui lòng xác thực email trước khi đăng nhập');
        }

        if (bcrypt.compareSync(password, user.password)) {
            return user;
        }
        return null;
    }

    login(user: User) {
        const payload = { sub: user.id, username: user.userName, role: user.roleId };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                userName: user.userName,
                email: user.email,
                fullName: user.fullName,
                roleId: user.roleId
            }
        };
    }

    async register(createUserDto: CreateUserDto) {
        const user = await this.userService.createUser(createUserDto);
        
        // Kiểm tra token trước khi gửi email
        if (!user.emailVerificationToken) {
            throw new BadRequestException('Lỗi tạo token xác thực email');
        }

        // Gửi email xác thực
        await this.mailService.sendEmailVerification(
            user.email, 
            user.emailVerificationToken, 
            user.userName
        );

        return {
            message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
            email: user.email
        };
    }

    async verifyEmail(token: string) {
        await this.userService.verifyEmail(token);
        return { message: 'Xác thực email thành công! Bây giờ bạn có thể đăng nhập.' };
    }

    async forgotPassword(email: string) {
        const user = await this.userService.generateResetPasswordToken(email);
        
        // Kiểm tra token trước khi gửi email
        if (!user.resetPasswordToken) {
            throw new BadRequestException('Lỗi tạo token đặt lại mật khẩu');
        }

        await this.mailService.sendPasswordReset(
            user.email,
            user.resetPasswordToken,
            user.userName
        );

        return { message: 'Email đặt lại mật khẩu đã được gửi!' };
    }

    async resetPassword(token: string, newPassword: string) {
        await this.userService.resetPassword(token, newPassword);
        return { message: 'Đặt lại mật khẩu thành công!' };
    }

    async resendVerification(email: string) {
        const user = await this.userService.findUserByUserNameOrEmail(email);
        if (!user) {
            throw new UnauthorizedException('Email không tồn tại');
        }

        if (user.status === UserStatus.VERIFIED) {
            throw new UnauthorizedException('Email đã được xác thực');
        }

        // Kiểm tra token trước khi gửi email
        if (!user.emailVerificationToken) {
            throw new BadRequestException('Token xác thực không tồn tại');
        }

        await this.mailService.sendEmailVerification(
            user.email,
            user.emailVerificationToken,
            user.userName
        );

        return { message: 'Email xác thực đã được gửi lại!' };
    }
}