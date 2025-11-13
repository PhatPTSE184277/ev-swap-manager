import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    BeforeInsert,
    BeforeUpdate,
    OneToMany
} from 'typeorm';
import { Booking } from './booking.entity';
import { BookingDetailStatus } from '../enums';
import { Battery } from './battery.entity';
import { Report } from './report.entity';

@Entity('booking_details')
export class BookingDetail {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    bookingId: number;

    @Column()
    batteryId: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    price: number;

    @Column({
        type: 'enum',
        enum: BookingDetailStatus,
        default: BookingDetailStatus.RESERVED
    })
    status: BookingDetailStatus;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    })
    updatedAt: Date;

    @ManyToOne(() => Booking)
    @JoinColumn({ name: 'bookingId' })
    booking: Booking;

    @ManyToOne(() => Battery)
    @JoinColumn({ name: 'batteryId' })
    battery: Battery;

    @OneToMany(() => Report, (report) => report.bookingDetail)
    reports: Report[];

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
