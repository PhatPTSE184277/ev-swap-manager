import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { readFile } from 'fs/promises';
import * as path from 'path';

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
                pass: this.configService.get<string>('MAIL_PASS')
            }
        });
    }

   async sendEmailVerification(
        email: string,
        token: string,
        userName: string
    ) {
        try {
            const verificationUrl = `${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${token}`;

            const templatePath = path.join(
                process.cwd(),
                'src',
                'modules',
                'mail',
                'html',
                'EmailVerify.html'
            );
            let html = await readFile(templatePath, 'utf-8');

            html = html
                .replace(/\$\{name\}/g, userName)
                .replace(/\$\{link\}/g, verificationUrl)
                .replace(/\$\{button\}/g, 'Xác thực email')
                .replace(/\$\{email\}/g, email)
                .replace(
                    /\$\{#dates.year\(date\)\}/g,
                    new Date().getFullYear().toString()
                );

            await this.transporter.sendMail({
                from: this.configService.get<string>('MAIL_FROM'),
                to: email,
                subject: 'Xác thực email tài khoản',
                html
            });
        } catch (error) {
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi gửi email xác thực');
        }
    }

    async sendPasswordReset(email: string, token: string, userName: string) {
        try {
            const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;

            const templatePath = path.join(
                process.cwd(),
                'src',
                'modules',
                'mail',
                'html',
                'EmailResetPassword.html'
            );
            let html = await readFile(templatePath, 'utf-8');

            html = html
                .replace(/\$\{name\}/g, userName)
                .replace(/\$\{link\}/g, resetUrl)
                .replace(/\$\{button\}/g, 'Đặt lại mật khẩu')
                .replace(/\$\{email\}/g, email)
                .replace(
                    /\$\{#dates.year\(date\)\}/g,
                    new Date().getFullYear().toString()
                );

            await this.transporter.sendMail({
                from: this.configService.get<string>('MAIL_FROM'),
                to: email,
                subject: 'Đặt lại mật khẩu',
                html
            });
        } catch (error) {
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi gửi email đặt lại mật khẩu');
        }
    }
}
