import { Module } from '@nestjs/common';
import { StationService } from './station.service';
import { StationController } from './station.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Battery, Cabinet, Slot, Station } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Station, Cabinet, Slot, Battery])],
  controllers: [StationController],
  providers: [StationService],
})
export class StationModule {}
