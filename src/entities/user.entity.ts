import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Role } from './role.entity';
import { UserMembership } from './user-membership.entity';
import { StationStaff } from './station-staff.entity';
import { UserVehicle } from './user-vehicle.entity';
import { Feedback } from './feedback.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, length: 50 })
    userName: string;

    @Column({ length: 100 })
    password: string;

    @Column({ unique: true, length: 100 })
    email: string;

    @Column({ length: 100, nullable: true })
    fullName: string;

    @Column({ nullable: true, length: 255 })
    avatar: string;

    @Column({ nullable: true, length: 10 })
    otp: string;

    @Column({ nullable: true })
    expireOtp: Date;

    @Column({ default: true })
    status: boolean;

    @Column()
    roleId: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    })
    updatedAt: Date;

    @ManyToOne(() => Role)
    @JoinColumn({ name: 'roleId' })
    role: Role;

    @OneToMany(() => UserMembership, userMembership => userMembership.user)
    userMemberships: UserMembership[];

    @OneToMany(() => StationStaff, stationStaff => stationStaff.user)
    stationStaffs: StationStaff[];

    @OneToMany(() => UserVehicle, userVehicle => userVehicle.user)
    userVehicles: UserVehicle[];

    @OneToMany(() => Feedback, feedback => feedback.user)
    feedbacks: Feedback[];
}