import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToOne,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { ChatMessage } from './chat-message.entity';

@Entity('chat-rooms')
export class ChatRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'created_by' })
  createdBy: number;

  @Column({ nullable: true })
  supporterId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  user: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'supporterId' })
  supporter: User;

  @OneToMany(() => ChatMessage, (message) => message.room)
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
