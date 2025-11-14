import { Module } from '@nestjs/common';
import { TransferBatteryService } from './transfer-battery.service';
import { TransferBatteryController } from './transfer-battery.controller';
import { Battery, Slot, SlotHistory } from 'src/entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Slot, Battery, SlotHistory])],
  controllers: [TransferBatteryController],
  providers: [TransferBatteryService],
})
export class TransferBatteryModule {}
