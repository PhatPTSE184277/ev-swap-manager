import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('MAIL_HOST'),
            port: this.configService.get<number>('MAIL_PORT'),
            secure: false,
            auth: {
                user: this.configService.get<string>('MAIL_USER'),
                pass: this.configService.get<string>('MAIL_PASS'),
            },
        });
    }

    async sendEmailVerification(email: string, token: string, userName: string) {
        const verificationUrl = `${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${token}`;
        
        await this.transporter.sendMail({
            from: this.configService.get<string>('MAIL_FROM'),
            to: email,
            subject: 'Xác thực email tài khoản',
            html: `
                <h2>Chào ${userName}!</h2>
                <p>Vui lòng click vào link bên dưới để xác thực email:</p>
                <a href="${verificationUrl}">Xác thực email</a>
                <p>Link này sẽ hết hạn sau 1 giờ.</p>
            `,
        });
    }

    async sendPasswordReset(email: string, token: string, userName: string) {
        const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;
        
        await this.transporter.sendMail({
            from: this.configService.get<string>('MAIL_FROM'),
            to: email,
            subject: 'Đặt lại mật khẩu',
            html: `
                <h2>Chào ${userName}!</h2>
                <p>Bạn đã yêu cầu đặt lại mật khẩu. Click vào link bên dưới:</p>
                <a href="${resetUrl}">Đặt lại mật khẩu</a>
                <p>Link này sẽ hết hạn sau 1 giờ.</p>
            `,
        });
    }
}