import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BatteryType } from './battery-type.entity';
import { UserVehicle } from './user-vehicle.entity';

@Entity('vehicle_types')
export class VehicleType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    batteryTypeId: number;

    @Column({ length: 100 })
    model: string;

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

    @ManyToOne(() => BatteryType)
    @JoinColumn({ name: 'batteryTypeId' })
    batteryType: BatteryType;

    @OneToMany(() => UserVehicle, userVehicle => userVehicle.vehicleType)
    userVehicles: UserVehicle[];
}