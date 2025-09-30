import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Station } from './station.entity';
import { Slot } from './slot.entity';
import { CabinetHistory } from './cabinet-history.entity';

export enum CabinetStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    MAINTENANCE = 'MAINTENANCE'
}

@Entity('cabinets')
export class Cabinet {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    stationId: number;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    temperature: number;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'enum', enum: CabinetStatus, default: CabinetStatus.ACTIVE })
    status: CabinetStatus;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    })
    updatedAt: Date;

    @ManyToOne(() => Station)
    @JoinColumn({ name: 'stationId' })
    station: Station;

    @OneToMany(() => Slot, slot => slot.cabinet)
    slots: Slot[];

    @OneToMany(() => CabinetHistory, cabinetHistory => cabinetHistory.cabinet)
    cabinetHistories: CabinetHistory[];
}