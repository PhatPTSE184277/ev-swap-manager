import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Cabinet } from './cabinet.entity';

@Entity('cabinet_histories')
export class CabinetHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    cabinetId: number;

    @Column()
    stationId: number;

    @Column({ type: 'timestamp' })
    dateChange: Date;

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

    @ManyToOne(() => Cabinet)
    @JoinColumn({ name: 'cabinetId' })
    cabinet: Cabinet;
}