import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './role.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, length: 50 })
    userName: string;

    @Column({ length: 100 })
    password: string;

    @Column({ unique: true, length: 100 })
    email: string;

    @Column({ nullable: true, length: 255 })
    avatar: string;

    @Column({ nullable: true, length: 10 })
    otp: string;

    @Column({ nullable: true })
    expireOtp: Date;

    @Column({ default: true })
    status: boolean;

    @Column()
    roleId: number;

    @ManyToOne(() => Role)
    @JoinColumn({ name: 'roleId' })
    role: Role;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    })
    updatedAt: Date;
}