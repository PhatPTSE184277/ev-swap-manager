import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
    BeforeInsert,
    BeforeUpdate
} from 'typeorm';
import { Station } from './station.entity';
import { Slot } from './slot.entity';
import { CabinetHistory } from './cabinet-history.entity';

@Entity('cabinets')
export class Cabinet {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @Column()
    stationId: number;

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

    @ManyToOne(() => Station)
    @JoinColumn({ name: 'stationId' })
    station: Station;

    @OneToMany(() => Slot, (slot) => slot.cabinet)
    slots: Slot[];

    @OneToMany(() => CabinetHistory, (cabinetHistory) => cabinetHistory.cabinet)
    cabinetHistories: CabinetHistory[];

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
