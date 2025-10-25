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

    @Column({ nullable: true })
    userVehicleId: number | null;

    @Column({ type: 'int', default: 100 })
    currentCapacity: number; // Đây là % pin hiện tại (0-100)

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

    @ManyToOne(() => UserVehicle, (vehicle) => vehicle.batteries)
    @JoinColumn({ name: 'userVehicleId' })
    userVehicle: UserVehicle;

    @OneToMany(() => SlotHistory, (slotHistory) => slotHistory.battery)
    slotHistories: SlotHistory[];

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

    /**
     * Tính healthScore dựa trên số chu kỳ đã dùng và cycleLife của BatteryType
     * (Giả sử: healthScore giảm tuyến tính theo số chu kỳ)
     */
    calcHealthScore(): number {
        if (!this.batteryType?.cycleLife || this.batteryType.cycleLife === 0)
            return 100;
        const percent =
            100 -
            Math.round((this.currentCycle / this.batteryType.cycleLife) * 100);
        return Math.max(0, percent);
    }

    /**
     * Tính % pin tăng lên sau một lần sạc (dựa vào thời gian sạc và tốc độ sạc)
     * @param minutesSạc: số phút đã sạc
     * @returns số % pin tăng thêm
     */
    calcChargePercentIncrease(minutesSac: number): number {
        // Giả sử chargeRate là số giờ để sạc đầy từ 0-100%
        if (!this.batteryType?.chargeRate || this.batteryType.chargeRate === 0)
            return 0;
        const totalMinutesToFull = this.batteryType.chargeRate * 60;
        const percentIncrease = (minutesSac / totalMinutesToFull) * 100;
        return Math.min(100, Math.max(0, Math.round(percentIncrease)));
    }
}
