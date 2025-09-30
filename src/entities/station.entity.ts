import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
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

    @Column({ type: 'decimal', precision: 10, scale: 8 })
    latitude: number;

    @Column({ type: 'decimal', precision: 11, scale: 8 })
    longitude: number;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    temperature: number;

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

    @OneToMany(() => StationStaff, stationStaff => stationStaff.station)
    stationStaffs: StationStaff[];

    @OneToMany(() => Cabinet, cabinet => cabinet.station)
    cabinets: Cabinet[];

    @OneToMany(() => StationStaffHistory, stationStaffHistory => stationStaffHistory.station)
    stationStaffHistories: StationStaffHistory[];

    @OneToMany(() => Feedback, feedback => feedback.station)
    feedbacks: Feedback[];
}