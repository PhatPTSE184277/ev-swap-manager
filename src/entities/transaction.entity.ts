import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    OneToOne,
    BeforeInsert,
    BeforeUpdate
} from 'typeorm';
import { Payment } from './payment.entity';
import { Booking } from './booking.entity';
import { UserMembership } from './user-membership.entity';
import { TransactionStatus } from '../enums';

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    paymentId: number;

    @Column({ nullable: true })
    userMembershipId: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalPrice: number;

    @Column({ type: 'timestamp' })
    dateTime: Date;

    @Column({
        type: 'enum',
        enum: TransactionStatus,
        default: TransactionStatus.PENDING
    })
    status: TransactionStatus;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    })
    updatedAt: Date;

    @ManyToOne(() => Payment)
    @JoinColumn({ name: 'paymentId' })
    payment: Payment;

    @ManyToOne(
        () => UserMembership,
        (userMembership) => userMembership.transactions,
        { nullable: true }
    )
    @JoinColumn({ name: 'userMembershipId' })
    userMembership: UserMembership;

    @OneToOne(() => Booking, (booking) => booking.transaction)
    booking: Booking;

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
