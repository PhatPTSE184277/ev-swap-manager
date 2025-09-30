import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Battery } from './battery.entity';
import { VehicleType } from './vehicle-type.entity';

@Entity('battery_types')
export class BatteryType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 255 })
    description: string;

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

    @OneToMany(() => Battery, battery => battery.batteryType)
    batteries: Battery[];

    @OneToMany(() => VehicleType, vehicleType => vehicleType.batteryType)
    vehicleTypes: VehicleType[];
}