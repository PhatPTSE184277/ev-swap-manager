import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('stations')
export class Station {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100, unique: true })
    name: string;

    @Column({ length: 255, nullable: true })
    description: string;

    @Column({ length: 255 })
    address: string;

    @Column({ type: 'float' })
    latitude: number;

    @Column({ type: 'float' })
    longitude: number;

    @Column({ type: 'int', default: 0 })
    totalCabinet: number;

    @Column({ type: 'float', nullable: true })
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
}