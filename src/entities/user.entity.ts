import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Role } from './role.entity';
import { UserMembership } from './user-membership.entity';
import { StationStaff } from './station-staff.entity';
import { UserVehicle } from './user-vehicle.entity';
import { Feedback } from './feedback.entity';
import { UserStatus } from '../enums/user.enum';
import { ChatMessage } from './chat-message.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ length: 100 })
  password: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 100, nullable: true })
  fullName: string;

  @Column({ nullable: true, length: 255 })
  avatar: string;

  @Column({ nullable: true, length: 10 })
  otp: string;

  @Column({ nullable: true, type: 'datetime' })
  expireOtp: Date;

  @Column({ nullable: true, length: 100, type: 'varchar' })
  emailVerificationToken: string | null;

  @Column({ nullable: true, type: 'datetime' })
  emailVerificationExpire: Date | null;

  @Column({ nullable: true, length: 100, type: 'varchar' })
  resetPasswordToken: string | null;

  @Column({ nullable: true, type: 'datetime' })
  resetPasswordExpire: Date | null;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_VERIFICATION,
  })
  status: UserStatus;

  @Column()
  roleId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @OneToMany(() => UserMembership, (userMembership) => userMembership.user)
  userMemberships: UserMembership[];

  @OneToMany(() => StationStaff, (stationStaff) => stationStaff.user)
  stationStaffs: StationStaff[];

  @OneToMany(() => UserVehicle, (userVehicle) => userVehicle.user)
  userVehicles: UserVehicle[];

  @OneToMany(() => Feedback, (feedback) => feedback.user)
  feedbacks: Feedback[];

  @OneToMany(() => ChatMessage, (message) => message.sender)
  messages: ChatMessage[];

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
