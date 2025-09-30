/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiOperation({ summary: 'Đăng ký tài khoản' })
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        return await this.authService.register(createUserDto);
    }

    @ApiOperation({ summary: 'Đăng nhập' })
    @UseGuards(LocalAuthGuard)
    @Post('login')
    login(@Request() req, @Body() loginDto: LoginDto) {
        return this.authService.login(req.user);
    }

    @ApiOperation({ summary: 'Xác thực email' })
    @Post('verify-email')
    async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
        return this.authService.verifyEmail(verifyEmailDto.token);
    }

    @ApiOperation({ summary: 'Gửi lại email xác thực' })
    @Post('resend-verification')
    async resendVerification(@Body() body: { email: string }) {
        return this.authService.resendVerification(body.email);
    }

    @ApiOperation({ summary: 'Quên mật khẩu' })
    @Post('forgot-password')
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto.email);
    }

    @ApiOperation({ summary: 'Đặt lại mật khẩu' })
    @Post('reset-password')
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
    }
}