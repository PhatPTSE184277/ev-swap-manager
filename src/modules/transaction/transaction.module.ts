import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction, UserMembership } from 'src/entities';
import { PayOSService } from '../pay-os/pay-os.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, UserMembership]),
    ConfigModule
  ],
  controllers: [TransactionController],
  providers: [TransactionService, PayOSService],
  exports: [TransactionService],
})
export class TransactionModule {}