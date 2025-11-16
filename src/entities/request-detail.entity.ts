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

@Entity('request_details')
export class RequestDetail {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    requestId: number;

    @Column()
    batteryId: number;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Request, (request) => request.requestDetails)
    @JoinColumn({ name: 'requestId' })
    request: Request;

    @ManyToOne(() => Battery)
    @JoinColumn({ name: 'batteryId' })
    battery: Battery;
}