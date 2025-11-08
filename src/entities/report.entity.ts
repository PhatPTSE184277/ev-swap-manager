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
import { ReportStatus } from 'src/enums/report.enum';

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

    @Column({
        type: 'enum',
        enum: ReportStatus,
        default: ReportStatus.PENDING,
        nullable: true
    })
    status: ReportStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => BookingDetail, (bookingDetail) => bookingDetail.reports, {
        nullable: true
    })
    @JoinColumn({ name: 'bookingDetailId' })
    bookingDetail: BookingDetail;

    @ManyToOne(() => User, (user) => user.reports, { nullable: true })
    @JoinColumn({ name: 'userId' })
    user: User;
}
