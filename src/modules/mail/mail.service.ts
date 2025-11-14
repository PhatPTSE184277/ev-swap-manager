import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFile } from 'fs/promises';
import * as path from 'path';
import sgMail from '@sendgrid/mail';

@Injectable()
export class MailService {
    constructor(private configService: ConfigService) {
        const sendGridApiKey =
            this.configService.get<string>('SENDGRID_API_KEY');
        if (!sendGridApiKey) {
            throw new InternalServerErrorException(
                'SENDGRID_API_KEY is not set'
            );
        }
        sgMail.setApiKey(sendGridApiKey);
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

            const fromEmail = this.configService.get<string>('MAIL_FROM');
            if (!fromEmail)
                throw new InternalServerErrorException('MAIL_FROM is not set');
            
            await sgMail.send({
                to: email,
                from: fromEmail,
                subject: 'Xác thực email tài khoản',
                html: html
            });
        } catch (error) {
            console.error('MAIL ERROR:', error);
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi gửi email xác thực'
            );
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

            const fromEmail = this.configService.get<string>('MAIL_FROM');
            if (!fromEmail)
                throw new InternalServerErrorException('MAIL_FROM is not set');
            
            await sgMail.send({
                to: email,
                from: fromEmail,
                subject: 'Đặt lại mật khẩu',
                html: html
            });
        } catch (error) {
            console.error('MAIL ERROR:', error);
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi gửi email đặt lại mật khẩu'
            );
        }
    }

    async sendStaffCredentials(
    email: string,
    fullName: string,
    username: string,
    password: string,
    stationName: string
): Promise<void> {
    try {
        const templatePath = path.join(
            process.cwd(),
            'src',
            'modules',
            'mail',
            'html',
            'StaffCredentials.html'
        );
        let html = await readFile(templatePath, 'utf-8');

        html = html
            .replace(/\$\{fullName\}/g, fullName)
            .replace(/\$\{username\}/g, username)
            .replace(/\$\{password\}/g, password)
            .replace(/\$\{stationName\}/g, stationName)
            .replace(/\$\{email\}/g, email)
            .replace(
                /\$\{#dates.year\(date\)\}/g,
                new Date().getFullYear().toString()
            );

        const fromEmail = this.configService.get<string>('MAIL_FROM');
        if (!fromEmail)
            throw new InternalServerErrorException('MAIL_FROM is not set');

        await sgMail.send({
            to: email,
            from: fromEmail,
            subject: 'Thông tin tài khoản nhân viên - EV Swap Manager',
            html: html
        });
    } catch (error) {
        console.error('[sendStaffCredentials] error:', error);
    }
}

    async sendReportStatus(
        email: string,
        fullName: string,
        isConfirmed: boolean,
        message: string
    ): Promise<void> {
        try {
            const templatePath = path.join(
                process.cwd(),
                'src',
                'modules',
                'mail',
                'html',
                'ReportStatus.html'
            );
            let html = await readFile(templatePath, 'utf-8');

            const statusText = isConfirmed ? 'xác nhận' : 'từ chối';
            const statusColor = isConfirmed ? '#d4edda' : '#f8d7da';
            const borderColor = isConfirmed ? '#28a745' : '#dc3545';

            html = html
                .replace(/\$\{fullName\}/g, fullName)
                .replace(/\$\{statusText\}/g, statusText)
                .replace(/\$\{statusColor\}/g, statusColor)
                .replace(/\$\{borderColor\}/g, borderColor)
                .replace(/\$\{message\}/g, message)
                .replace(/\$\{email\}/g, email)
                .replace(
                    /\$\{#dates.year\(date\)\}/g,
                    new Date().getFullYear().toString()
                );

            const fromEmail = this.configService.get<string>('MAIL_FROM');
            if (!fromEmail)
                throw new InternalServerErrorException('MAIL_FROM is not set');

            await sgMail.send({
                to: email,
                from: fromEmail,
                subject: `Thông báo trạng thái báo cáo lỗi pin - amply`,
                html: html
            });
        } catch (error) {
            console.error('[sendReportStatus] error:', error);
        }
    }

}