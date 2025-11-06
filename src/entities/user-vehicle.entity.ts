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
import { User } from './user.entity';
import { VehicleType } from './vehicle-type.entity';
import { Battery } from './battery.entity';
import { Booking } from './booking.entity';

@Entity('user_vehicles')
export class UserVehicle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    vehicleTypeId: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    name: string;

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

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => VehicleType)
    @JoinColumn({ name: 'vehicleTypeId' })
    vehicleType: VehicleType;

    @OneToMany(() => Battery, (battery) => battery.userVehicle)
    batteries: Battery[];

    @OneToMany(() => Booking, (booking) => booking.userVehicle)
    bookings: Booking[];

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
