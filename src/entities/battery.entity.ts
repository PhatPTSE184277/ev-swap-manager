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

    @Column({ type: 'int', default: 0 })
    currentCycle: number;

    @Column({ type: 'int', default: 100 })
    currentCapacity: number;

    @Column({ type: 'int', default: 100 })
    healthScore: number;

    @Column({ type: 'timestamp', nullable: true })
    lastChargeTime: Date;

    @Column({ type: 'timestamp', nullable: true })
    estimatedFullChargeTime: Date;

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

    /**
     * Tính thời gian sạc còn lại (phút)
     */
    getRemainingChargeTime(): number {
        if (!this.estimatedFullChargeTime) return 0;
        const now = new Date();
        const diff = this.estimatedFullChargeTime.getTime() - now.getTime();
        return Math.max(0, Math.ceil(diff / 60000)); // Trả về phút
    }

    /**
     * Tính số chu kỳ còn lại trước khi chai
     */
    getRemainingCycles(): number {
        if (!this.batteryType?.cycleLife) return 0;
        return Math.max(0, this.batteryType.cycleLife - this.currentCycle);
    }

    /**
     * Kiểm tra pin có cần thay thế không
     */
    needsReplacement(): boolean {
        if (!this.batteryType?.cycleLife) return false;
        return this.healthScore < 20 || this.currentCycle >= this.batteryType.cycleLife * 0.9;
    }

    /**
     * Tính % tuổi thọ còn lại
     */
    getLifespanPercentage(): number {
        if (!this.batteryType?.cycleLife) return 100;
        return Math.max(0, Math.round((1 - this.currentCycle / this.batteryType.cycleLife) * 100));
    }

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