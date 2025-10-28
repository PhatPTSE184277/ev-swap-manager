import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from 'src/entities/booking.entity';
import { Membership } from 'src/entities/membership.entity';
import { UserMembership } from 'src/entities/user-membership.entity';
import { Battery } from 'src/entities/battery.entity';
import { Slot } from 'src/entities/slot.entity';
import { UserVehicle } from 'src/entities/user-vehicle.entity';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { BatteryGateway } from 'src/gateways/battery.gateway';
import { SlotGateway } from 'src/gateways/slot.gateway';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Booking,
            Membership,
            UserMembership,
            Battery,
            Slot,
            UserVehicle
        ]),
        TransactionModule
    ],
    providers: [BookingService, BatteryGateway, SlotGateway],
    controllers: [BookingController],
    exports: [BookingService]
})
export class BookingModule {}
