import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { Battery } from './battery.entity';
import { VehicleType } from './vehicle-type.entity';

@Entity('battery_types')
export class BatteryType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 255, nullable: true })
    description?: string;

    @Column({ type: 'float', nullable: true })
    capacityKWh: number;

    @Column({ type: 'int', nullable: true })
    cycleLife: number;

    @Column({ type: 'float', default: 2.5 })
    chargeRate: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    pricePerSwap: number;

    @Column({ type: 'boolean', default: true })
    status: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @OneToMany(() => Battery, (battery) => battery.batteryType)
    batteries: Battery[];

    @OneToMany(() => VehicleType, (vehicleType) => vehicleType.batteryType)
    vehicleTypes: VehicleType[];

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
