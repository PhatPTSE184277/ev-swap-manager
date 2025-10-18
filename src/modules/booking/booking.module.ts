import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking, Membership, UserMembership } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, UserMembership, Membership])],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
