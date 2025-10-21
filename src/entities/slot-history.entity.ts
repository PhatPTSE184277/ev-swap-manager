import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    BeforeInsert,
    BeforeUpdate
} from 'typeorm';
import { Slot } from './slot.entity';
import { Battery } from './battery.entity';

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

    @ManyToOne(() => Slot)
    @JoinColumn({ name: 'slotId' })
    slot: Slot;

    @ManyToOne(() => Battery)
    @JoinColumn({ name: 'batteryId' })
    battery: Battery;

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
