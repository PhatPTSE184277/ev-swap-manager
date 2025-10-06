import { Module } from '@nestjs/common';
import { UserVehicleService } from './user-vehicle.service';
import { UserVehicleController } from './user-vehicle.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Battery, User, UserVehicle } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([UserVehicle, User, Battery])],
  controllers: [UserVehicleController],
  providers: [UserVehicleService],
})
export class UserVehicleModule {}
