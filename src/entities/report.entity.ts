import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';
import { BookingDetail } from './booking-detail.entity';
import { User } from './user.entity';

@Entity('reports')
export class Report {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    bookingDetailId: number;

    @Column({ nullable: true })
    userId: number;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ default: 'PENDING', nullable: true })
    status: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => BookingDetail, (bookingDetail) => bookingDetail.reports, { nullable: true })
    @JoinColumn({ name: 'bookingDetailId' })
    bookingDetail: BookingDetail;

    @ManyToOne(() => User, (user) => user.reports, { nullable: true })
    @JoinColumn({ name: 'userId' })
    user: User;
}