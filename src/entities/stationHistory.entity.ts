import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from 'typeorm';
import { StationStaff } from './stationStaff.entity';
import { Station } from './station.entity';

export enum ShiftType {
    MORNING = 'MORNING',
    AFTERNOON = 'AFTERNOON',
    NIGHT = 'NIGHT'
}

@Entity('station_histories')
export class StationHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'enum', enum: ShiftType })
    shift: ShiftType;

    @ManyToOne(() => StationStaff, { nullable: false })
    @JoinColumn({ name: 'stationStaffId' })
    stationStaff: StationStaff;

    @ManyToOne(() => Station, { nullable: false })
    @JoinColumn({ name: 'stationId' })
    station: Station;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    })
    updatedAt: Date;
}
