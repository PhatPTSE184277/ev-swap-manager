import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    BeforeInsert,
    BeforeUpdate
} from 'typeorm';
import { StationStaff } from './station-staff.entity';
import { Station } from './station.entity';

@Entity('station_staff_histories')
export class StationStaffHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    stationStaffId: number;

    @Column()
    stationId: number;

    @Column({ type: 'timestamp', nullable: true })
    date: Date;

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
