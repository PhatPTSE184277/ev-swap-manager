import { Module } from '@nestjs/common';
import { StationStaffService } from './station-staff.service';
import { StationStaffController } from './station-staff.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StationStaff, StationStaffHistory } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([StationStaff, StationStaffHistory])],
  controllers: [StationStaffController],
  providers: [StationStaffService],
})
export class StationStaffModule {}
