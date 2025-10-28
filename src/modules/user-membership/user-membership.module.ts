import { Module } from '@nestjs/common';
import { UserMembershipService } from './user-membership.service';
import { UserMembershipController } from './user-membership.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Membership, Transaction, User, UserMembership } from 'src/entities';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [TypeOrmModule.forFeature([Membership, UserMembership, User, Transaction]), TransactionModule],
  controllers: [UserMembershipController],
  providers: [UserMembershipService],
})
export class UserMembershipModule {}
