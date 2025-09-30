import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Station } from './station.entity';
import { StationStaffHistory } from './station-staff-history.entity';

export enum StationStaffStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

@Entity('station_staffs')
export class StationStaff {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    stationId: number;

    @Column({ type: 'boolean', default: true })
    isHead: boolean;

    @Column({ type: 'enum', enum: StationStaffStatus, default: StationStaffStatus.ACTIVE })
    status: StationStaffStatus;

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

    @ManyToOne(() => Station)
    @JoinColumn({ name: 'stationId' })
    station: Station;

    @OneToMany(() => StationStaffHistory, stationStaffHistory => stationStaffHistory.stationStaff)
    stationStaffHistories: StationStaffHistory[];
}