import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Membership } from './membership.entity';
import { Booking } from './booking.entity';
import { UserMembershipStatus } from '../enums';

@Entity('user_memberships')
export class UserMembership {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    membershipId: number;

    @Column({ type: 'timestamp' })
    expiredDate: Date;

    @Column({ type: 'enum', enum: UserMembershipStatus, default: UserMembershipStatus.ACTIVE })
    status: UserMembershipStatus;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    })
    updatedAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Membership)
    @JoinColumn({ name: 'membershipId' })
    membership: Membership;

    @OneToMany(() => Booking, booking => booking.userMembership)
    bookings: Booking[];
}