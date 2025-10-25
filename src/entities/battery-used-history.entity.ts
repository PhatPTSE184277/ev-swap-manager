import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Battery } from './battery.entity';
import { Booking } from './booking.entity';

@Entity('battery_used_histories')
export class BatteryUsedHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    batteryId: number;

    @Column()
    bookingId: number;

    @Column({ type: 'int' })
    currentCapacity: number;

    @Column({ type: 'int' })
    currentCycle: number;

    @Column({ type: 'int' })
    healthScore: number;

    @Column({ type: 'int' })
    percent: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    recentPrice: number;

    @Column({ type: 'boolean', default: true })
    status: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    })
    updatedAt: Date;

    @ManyToOne(() => Battery)
    @JoinColumn({ name: 'batteryId' })
    battery: Battery;

    @ManyToOne(() => Booking)
    @JoinColumn({ name: 'bookingId' })
    booking: Booking;

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