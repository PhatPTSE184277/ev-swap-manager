import { Module } from '@nestjs/common';
import { VehicleTypeService } from './vehicle-type.service';
import { VehicleTypeController } from './vehicle-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleType } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleType])],
  controllers: [VehicleTypeController],
  providers: [VehicleTypeService],
})
export class VehicleTypeModule {}
