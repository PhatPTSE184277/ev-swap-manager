import { Module } from '@nestjs/common';
import { BatteryService } from './battery.service';
import { BatteryController } from './battery.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Battery, BatteryType } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Battery, BatteryType])],
  controllers: [BatteryController],
  providers: [BatteryService],
})
export class BatteryModule {}
