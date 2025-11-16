import { Module } from '@nestjs/common';
import { BatteryService } from './battery.service';
import { BatteryController } from './battery.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Battery, BatteryType } from 'src/entities';
import { Request } from 'src/entities/request.entity';
import { RequestDetail } from 'src/entities/request-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Battery, BatteryType, Request, RequestDetail])],
  controllers: [BatteryController],
  providers: [BatteryService],
})
export class BatteryModule {}
