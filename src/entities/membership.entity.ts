import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserMembership } from './user-membership.entity';

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

    @Column({ type: 'int', nullable: true })
    swapLimit: number | null;

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

    @OneToMany(() => UserMembership, userMembership => userMembership.membership)
    userMemberships: UserMembership[];
}