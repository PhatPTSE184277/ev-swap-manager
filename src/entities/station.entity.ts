import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    OneToMany,
    BeforeInsert,
    BeforeUpdate
} from 'typeorm';
import { StationStaff } from './station-staff.entity';
import { Cabinet } from './cabinet.entity';
import { StationStaffHistory } from './station-staff-history.entity';
import { Feedback } from './feedback.entity';

@Entity('stations')
export class Station {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 255 })
    description: string;

    @Column({ length: 255 })
    address: string;

    @Column({ length: 255, nullable: true })
    image: string;

    @Column({ type: 'decimal', precision: 10, scale: 8 })
    latitude: number;

    @Column({ type: 'decimal', precision: 11, scale: 8 })
    longitude: number;

    @Column({ type: 'time', nullable: true })
    openTime: string;

    @Column({ type: 'time', nullable: true })
    closeTime: string;

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

    @OneToMany(() => StationStaff, (stationStaff) => stationStaff.station)
    stationStaffs: StationStaff[];

    @OneToMany(() => Cabinet, (cabinet) => cabinet.station)
    cabinets: Cabinet[];

    @OneToMany(
        () => StationStaffHistory,
        (stationStaffHistory) => stationStaffHistory.station
    )
    stationStaffHistories: StationStaffHistory[];

    @OneToMany(() => Feedback, (feedback) => feedback.station)
    feedbacks: Feedback[];

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
