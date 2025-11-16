import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany
} from 'typeorm';
import { Station } from './station.entity';
import { BatteryType } from './battery-type.entity';
import { RequestStatus } from '../enums';
import { User } from './user.entity';
import { RequestDetail } from './request-detail.entity';

@Entity('requests')
export class Request {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    stationId: number;

    @Column()
    batteryTypeId: number;

    @Column({ type: 'int', nullable: true })
    requestedBy: number | null;

    @Column({ type: 'int' })
    requestedQuantity: number;

    @Column({ type: 'int', default: 0 })
    approvedQuantity: number;

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

    @ManyToOne(() => Station)
    @JoinColumn({ name: 'stationId' })
    station: Station;

    @ManyToOne(() => BatteryType)
    @JoinColumn({ name: 'batteryTypeId' })
    batteryType: BatteryType;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'requestedBy' })
    requester: User;

    @OneToMany(() => RequestDetail, (detail) => detail.request)
    requestDetails: RequestDetail[];
}