import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Cabinet } from './cabinet.entity';
import { Battery } from './battery.entity';
import { SlotHistory } from './slot-history.entity';
import { BookingDetail } from './booking-detail.entity';

export enum SlotStatus {
    AVAILABLE = 'AVAILABLE',
    OCCUPIED = 'OCCUPIED',
    MAINTENANCE = 'MAINTENANCE'
}

@Entity('slots')
export class Slot {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    cabinetId: number;

    @Column({ nullable: true })
    batteryId: number;

    @Column({ type: 'enum', enum: SlotStatus, default: SlotStatus.AVAILABLE })
    status: SlotStatus;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    })
    updatedAt: Date;

    @ManyToOne(() => Cabinet)
    @JoinColumn({ name: 'cabinetId' })
    cabinet: Cabinet;

    @ManyToOne(() => Battery)
    @JoinColumn({ name: 'batteryId' })
    battery: Battery;

    @OneToMany(() => SlotHistory, slotHistory => slotHistory.slot)
    slotHistories: SlotHistory[];

    @OneToMany(() => BookingDetail, bookingDetail => bookingDetail.oldBatterySlot)
    bookingDetails: BookingDetail[];
}