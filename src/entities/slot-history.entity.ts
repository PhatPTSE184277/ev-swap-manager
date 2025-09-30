import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Slot } from './slot.entity';
import { Battery } from './battery.entity';

export enum SlotHistoryStatus {
    AVAILABLE = 'AVAILABLE',
    OCCUPIED = 'OCCUPIED',
    MAINTENANCE = 'MAINTENANCE'
}

@Entity('slot_histories')
export class SlotHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    slotId: number;

    @Column()
    batteryId: number;

    @Column({ type: 'timestamp' })
    date: Date;

    @Column({ type: 'enum', enum: SlotHistoryStatus })
    status: SlotHistoryStatus;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    })
    updatedAt: Date;

    @ManyToOne(() => Slot)
    @JoinColumn({ name: 'slotId' })
    slot: Slot;

    @ManyToOne(() => Battery)
    @JoinColumn({ name: 'batteryId' })
    battery: Battery;
}