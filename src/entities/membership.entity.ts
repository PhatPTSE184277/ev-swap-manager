import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserMembership } from './user-membership.entity';

export enum MembershipStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

@Entity('memberships')
export class Membership {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 255 })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ type: 'int' })
    duration: number;

    @Column({ type: 'enum', enum: MembershipStatus, default: MembershipStatus.ACTIVE })
    status: MembershipStatus;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    })
    updatedAt: Date;

    @OneToMany(() => UserMembership, userMembership => userMembership.membership)
    userMemberships: UserMembership[];
}