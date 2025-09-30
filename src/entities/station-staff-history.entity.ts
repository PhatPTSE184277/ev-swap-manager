import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { StationStaff } from './station-staff.entity';
import { Station } from './station.entity';

export enum StaffHistoryShift {
    MORNING = 'MORNING',
    AFTERNOON = 'AFTERNOON',
    NIGHT = 'NIGHT'
}

@Entity('station_staff_histories')
export class StationStaffHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    stationStaffId: number;

    @Column()
    stationId: number;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'enum', enum: StaffHistoryShift })
    shift: StaffHistoryShift;

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

    @ManyToOne(() => StationStaff)
    @JoinColumn({ name: 'stationStaffId' })
    stationStaff: StationStaff;

    @ManyToOne(() => Station)
    @JoinColumn({ name: 'stationId' })
    station: Station;
}