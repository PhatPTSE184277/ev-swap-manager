import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from 'src/entities/report.entity';
import { BookingDetail } from 'src/entities/booking-detail.entity';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Report, BookingDetail])],
    providers: [ReportService],
    controllers: [ReportController],
    exports: [ReportService]
})
export class ReportModule {}