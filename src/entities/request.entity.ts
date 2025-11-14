import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';
import { Station } from './station.entity';
import { Battery } from './battery.entity';
import { RequestStatus } from '../enums';

@Entity('requests')
export class Request {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    batteryId: number;

    @Column()
    currentStationId: number;

    @Column()
    newStationId: number;

    @Column({
        type: 'enum',
        enum: RequestStatus,
        default: RequestStatus.PENDING
    })
    status: RequestStatus;

    @Column({ type: 'text', nullable: true })
    note: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Battery)
    @JoinColumn({ name: 'batteryId' })
    battery: Battery;

    @ManyToOne(() => Station)
    @JoinColumn({ name: 'currentStationId' })
    currentStation: Station;

    @ManyToOne(() => Station)
    @JoinColumn({ name: 'newStationId' })
    newStation: Station;
}
