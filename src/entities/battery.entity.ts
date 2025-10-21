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
import { BatteryType } from './battery-type.entity';
import { BatteryUsedHistory } from './battery-used-history.entity';
import { SlotHistory } from './slot-history.entity';
import { UserVehicle } from './user-vehicle.entity';
import { Slot } from './slot.entity';
import { BatteryStatus } from '../enums';

@Entity('batteries')
export class Battery {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    batteryTypeId: number;

    @Column({ length: 100 })
    model: string;

    @Column({ type: 'int' })
    capacity: number;

    @Column({ type: 'int' })
    cycleLife: number;

    @Column({
        type: 'enum',
        enum: BatteryStatus,
        default: BatteryStatus.AVAILABLE
    })
    status: BatteryStatus;

    @Column({ type: 'timestamp' })
    createdAt: Date;

    @Column({ type: 'timestamp' })
    updatedAt: Date;

    @ManyToOne(() => BatteryType)
    @JoinColumn({ name: 'batteryTypeId' })
    batteryType: BatteryType;

    @OneToMany(
        () => BatteryUsedHistory,
        (batteryUsedHistory) => batteryUsedHistory.battery
    )
    batteryUsedHistories: BatteryUsedHistory[];

    @OneToMany(() => SlotHistory, (slotHistory) => slotHistory.battery)
    slotHistories: SlotHistory[];

    @OneToMany(() => UserVehicle, (userVehicle) => userVehicle.battery)
    userVehicles: UserVehicle[];

    @OneToMany(() => Slot, (slot) => slot.battery)
    slots: Slot[];

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
