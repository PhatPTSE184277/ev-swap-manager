import { Module } from '@nestjs/common';
import { AnalyticService } from './analytic.service';
import { AnalyticController } from './analytic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking, Transaction } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Booking])],
  controllers: [AnalyticController],
  providers: [AnalyticService],
})
export class AnalyticModule {}
