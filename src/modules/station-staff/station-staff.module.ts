import { Module } from '@nestjs/common';
import { StationStaffService } from './station-staff.service';
import { StationStaffController } from './station-staff.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Station, StationStaff, StationStaffHistory } from 'src/entities';
import { MailModule } from '../mail/mail.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([StationStaff, StationStaffHistory, Station]), MailModule,  UserModule],
  controllers: [StationStaffController],
  providers: [StationStaffService],
})
export class StationStaffModule {}
