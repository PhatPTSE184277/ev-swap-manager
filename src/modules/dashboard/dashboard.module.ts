import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Booking, Station, Transaction, UserMembership } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, Station, UserMembership, Booking, Transaction])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}