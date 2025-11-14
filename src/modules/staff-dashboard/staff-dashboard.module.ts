import { Module } from '@nestjs/common';
import { StaffDashboardService } from './staff-dashboard.service';
import { StaffDashboardController } from './staff-dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking, Transaction } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Booking])],
  controllers: [StaffDashboardController],
  providers: [StaffDashboardService],
})
export class StaffDashboardModule {}
