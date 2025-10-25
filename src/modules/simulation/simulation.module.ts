import { Module } from '@nestjs/common';
import { SimulationService } from './simulation.service';
import { SimulationController } from './simulation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Battery, BatteryUsedHistory, Cabinet, Slot, SlotHistory } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Slot, Battery, SlotHistory, BatteryUsedHistory])],
  controllers: [SimulationController],
  providers: [SimulationService],
})
export class SimulationModule {}
