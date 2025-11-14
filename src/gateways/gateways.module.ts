import { Module } from '@nestjs/common';
import { TransactionGateway } from './transaction.gateway';
import { RequestGateway } from './request.gateway';

@Module({
  providers: [TransactionGateway, RequestGateway],
  exports: [TransactionGateway, RequestGateway],
})
export class GatewaysModule {}