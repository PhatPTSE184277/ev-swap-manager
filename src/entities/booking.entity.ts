import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { UserVehicle } from './user-vehicle.entity';
import { UserMembership } from './user-membership.entity';
import { Transaction } from './transaction.entity';
import { BookingDetail } from './booking-detail.entity';
import { BatteryUsedHistory } from './battery-used-history.entity';
import { BookingStatus } from '../enums';

@Entity('bookings')
export class Booking {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userVehicleId: number;

    @Column()
    userMembershipId: number;

    @Column()
    transactionId: number;

    @Column()
    batteryId: number;

    @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
    status: BookingStatus;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    })
    updatedAt: Date;

    @ManyToOne(() => UserVehicle)
    @JoinColumn({ name: 'userVehicleId' })
    userVehicle: UserVehicle;

    @ManyToOne(() => UserMembership)
    @JoinColumn({ name: 'userMembershipId' })
    userMembership: UserMembership;

    @OneToOne(() => Transaction)
    @JoinColumn({ name: 'transactionId' })
    transaction: Transaction;

    @OneToMany(() => BookingDetail, bookingDetail => bookingDetail.booking)
    bookingDetails: BookingDetail[];

    @OneToMany(() => BatteryUsedHistory, batteryUsedHistory => batteryUsedHistory.booking)
    batteryUsedHistories: BatteryUsedHistory[];
}