import { Module } from '@nestjs/common';
import { BatteryTypeService } from './battery-type.service';
import { BatteryTypeController } from './battery-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatteryType } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([BatteryType])],
  controllers: [BatteryTypeController],
  providers: [BatteryTypeService],
})
export class BatteryTypeModule {}
