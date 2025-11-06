import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import {
  Role,
  User,
  Membership,
  UserMembership,
  Station,
  StationStaff,
  StationStaffHistory,
  Cabinet,
  CabinetHistory,
  Slot,
  SlotHistory,
  BatteryType,
  Battery,
  BatteryUsedHistory,
  VehicleType,
  UserVehicle,
  Payment,
  Transaction,
  Booking,
  BookingDetail,
  Feedback
} from 'src/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      User,
      Membership,
      UserMembership,
      Station,
      StationStaff,
      StationStaffHistory,
      Cabinet,
      CabinetHistory,
      Slot,
      SlotHistory,
      BatteryType,
      Battery,
      BatteryUsedHistory,
      VehicleType,
      UserVehicle,
      Payment,
      Transaction,
      Booking,
      BookingDetail,
      Feedback
    ])
  ],
  controllers: [SeedController],
  providers: [SeedService],
  exports: [SeedService]
})
export class SeedModule {}