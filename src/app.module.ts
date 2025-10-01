import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { UserModule } from './modules/user/user.module';
import { SeedModule } from './modules/seed/seed.module';
import { BatteryModule } from './modules/battery/battery.module';
import { BatteryTypeModule } from './modules/battery-type/battery-type.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService): TypeOrmModuleOptions =>
                typeOrmConfig(configService)
        }),
        UserModule,
        AuthModule,
        MailModule,
        SeedModule,
        BatteryModule,
        BatteryTypeModule
    ],
    controllers: [],
    providers: [
    ]
})
export class AppModule {}
