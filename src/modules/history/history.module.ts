import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatteryUsedHistory, CabinetHistory, SlotHistory, StationStaffHistory } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([BatteryUsedHistory, CabinetHistory, SlotHistory, StationStaffHistory])],
  controllers: [HistoryController],
  providers: [HistoryService],
})
export class HistoryModule {}
