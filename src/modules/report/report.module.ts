import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from 'src/entities/report.entity';
import { BookingDetail } from 'src/entities/booking-detail.entity';
import { Booking } from 'src/entities/booking.entity';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Report, BookingDetail, Booking]),
        MailModule
    ],
    providers: [ReportService],
    controllers: [ReportController],
    exports: [ReportService]
})
export class ReportModule {}