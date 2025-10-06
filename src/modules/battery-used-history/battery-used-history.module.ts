import { Module } from '@nestjs/common';
import { BatteryUsedHistoryService } from './battery-used-history.service';
import { BatteryUsedHistoryController } from './battery-used-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatteryUsedHistory } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([BatteryUsedHistory])],
  controllers: [BatteryUsedHistoryController],
  providers: [BatteryUsedHistoryService],
})
export class BatteryUsedHistoryModule {}
