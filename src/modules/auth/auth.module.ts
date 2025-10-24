import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { MailModule } from '../mail/mail.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStrategy } from './strategies/local.stategy';
import { JwtStrategy } from './strategies/jwt.stategy';
import { QrLoginController } from './qr-login.controller';
import { QrLoginService } from './qr-login.service';
import { QrGateway } from 'src/gateways/qr.gateway';
@Module({
  imports: [
    UserModule,
    MailModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'secret',
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, QrLoginController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    QrLoginService,
    QrGateway,
  ],
  exports: [AuthService],
})
export class AuthModule {}
