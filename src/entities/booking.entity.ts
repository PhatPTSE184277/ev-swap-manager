import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
    OneToOne,
    BeforeInsert,
    BeforeUpdate
} from 'typeorm';
import { UserVehicle } from './user-vehicle.entity';
import { UserMembership } from './user-membership.entity';
import { Transaction } from './transaction.entity';
import { BookingDetail } from './booking-detail.entity';
import { BatteryUsedHistory } from './battery-used-history.entity';
import { BookingStatus } from '../enums';
import { Station } from './station.entity';

@Entity('bookings')
export class Booking {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userVehicleId: number;

    @Column({ nullable: true })
    userMembershipId: number;

    @Column({ nullable: true })
    transactionId: number;

    @Column()
    stationId: number;

    @Column({ type: 'timestamp', nullable: true })
    expectedPickupTime: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    paymentExpireAt: Date | null;

    @Column({ type: 'boolean', default: false })
    isFree: boolean;

    @Column({ type: 'timestamp', nullable: true })
    checkinTime: Date;

    @Column({
        type: 'enum',
        enum: BookingStatus,
        default: BookingStatus.RESERVED
    })
    status: BookingStatus;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    })
    updatedAt: Date;

    @ManyToOne(() => Station)
    @JoinColumn({ name: 'stationId' })
    station: Station;

    @ManyToOne(() => UserVehicle)
    @JoinColumn({ name: 'userVehicleId' })
    userVehicle: UserVehicle;

    @ManyToOne(() => UserMembership)
    @JoinColumn({ name: 'userMembershipId' })
    userMembership: UserMembership;

    @OneToOne(() => Transaction)
    @JoinColumn({ name: 'transactionId' })
    transaction: Transaction;

    @OneToMany(() => BookingDetail, (bookingDetail) => bookingDetail.booking)
    bookingDetails: BookingDetail[];

    @OneToMany(
        () => BatteryUsedHistory,
        (batteryUsedHistory) => batteryUsedHistory.booking
    )
    batteryUsedHistories: BatteryUsedHistory[];

    @BeforeInsert()
    setCreatedAtVN() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    @BeforeUpdate()
    setUpdatedAtVN() {
        this.updatedAt = new Date();
    }
}
