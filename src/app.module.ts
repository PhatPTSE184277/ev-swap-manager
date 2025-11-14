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
import { StationModule } from './modules/station/station.module';
import { BatteryUsedHistoryModule } from './modules/battery-used-history/battery-used-history.module';
import { VehicleTypeModule } from './modules/vehicle-type/vehicle-type.module';
import { UserVehicleModule } from './modules/user-vehicle/user-vehicle.module';
import { BookingModule } from './modules/booking/booking.module';
import { MembershipModule } from './modules/membership/membership.module';
import { CabinetModule } from './modules/cabinet/cabinet.module';
import { StationStaffModule } from './modules/station-staff/station-staff.module';
import { SlotModule } from './modules/slot/slot.module';
import { UserMembershipModule } from './modules/user-membership/user-membership.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { BatteryGateway } from './gateways/battery.gateway';
import { ScheduleModule } from '@nestjs/schedule';
import { SimulationModule } from './modules/simulation/simulation.module';
import { ChatRoomModule } from './modules/chat-room/chat-room.module';
import { ChatMessageModule } from './modules/chat-message/chat-message.module';
import { PaymentModule } from './modules/payment/payment.module';
import { PayOSModule } from './modules/pay-os/pay-os.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { TransactionGateway } from './gateways/transaction.gateway';
import { CleanupModule } from './modules/cleanup/cleanup.module';
import { ReportModule } from './modules/report/report.module';
import { AnalyticModule } from './modules/analytic/analytic.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { RequestModule } from './modules/request/request.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions =>
        typeOrmConfig(configService),
    }),
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    MailModule,
    SeedModule,
    BatteryModule,
    BatteryTypeModule,
    StationModule,
    BatteryUsedHistoryModule,
    VehicleTypeModule,
    UserVehicleModule,
    BookingModule,
    MembershipModule,
    CabinetModule,
    StationStaffModule,
    SlotModule,
    UserMembershipModule,
    TransactionModule,
    SimulationModule,
    ChatRoomModule,
    ChatMessageModule,
    CleanupModule,
    PayOSModule,
    PaymentModule,
    FeedbackModule,
    ReportModule,
    AnalyticModule,
    DashboardModule,
    RequestModule,
  ],
  controllers: [],
  providers: [BatteryGateway, TransactionGateway],
  exports: [BatteryGateway, TransactionGateway],
})
export class AppModule {}
