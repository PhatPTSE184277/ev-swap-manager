import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { VehicleType } from './vehicle-type.entity';
import { Battery } from './battery.entity';
import { Booking } from './booking.entity';

export enum UserVehicleStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

@Entity('user_vehicles')
export class UserVehicle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    vehicleTypeId: number;

    @Column()
    batteryId: number;

    @Column({ type: 'enum', enum: UserVehicleStatus, default: UserVehicleStatus.ACTIVE })
    status: UserVehicleStatus;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    })
    updatedAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => VehicleType)
    @JoinColumn({ name: 'vehicleTypeId' })
    vehicleType: VehicleType;

    @ManyToOne(() => Battery)
    @JoinColumn({ name: 'batteryId' })
    battery: Battery;

    @OneToMany(() => Booking, booking => booking.userVehicle)
    bookings: Booking[];
}