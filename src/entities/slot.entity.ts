import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
    BeforeInsert,
    BeforeUpdate
} from 'typeorm';
import { Cabinet } from './cabinet.entity';
import { Battery } from './battery.entity';
import { SlotHistory } from './slot-history.entity';
import { SlotStatus } from '../enums';

@Entity('slots')
export class Slot {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    cabinetId: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    batteryId: number | null;

    @Column({ type: 'enum', enum: SlotStatus, default: SlotStatus.EMPTY })
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

    @OneToMany(() => SlotHistory, (slotHistory) => slotHistory.slot)
    slotHistories: SlotHistory[];

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
