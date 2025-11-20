import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn
} from 'typeorm';
import { Request } from './request.entity';
import { Battery } from './battery.entity';
import { RequestDetailStatus } from '../enums/request.enum';

@Entity('request_details')
export class RequestDetail {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    requestId: number;

    @Column()
    batteryId: number;

    @Column({
        type: 'enum',
        enum: RequestDetailStatus,
        default: RequestDetailStatus.TRANSFERRING
    })
    status: RequestDetailStatus;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Request, (request) => request.requestDetails)
    @JoinColumn({ name: 'requestId' })
    request: Request;

    @ManyToOne(() => Battery)
    @JoinColumn({ name: 'batteryId' })
    battery: Battery;
}
