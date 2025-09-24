import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('station_staffs')
export class StationStaff {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: false })
    isHeader: boolean;

    @Column({ default: true })
    status: boolean;

    @Column({ unique: true })
    userId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
    
    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    })
    updatedAt: Date;
}