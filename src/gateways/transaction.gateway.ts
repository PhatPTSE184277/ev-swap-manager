import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true, namespace: '/transaction' })
export class TransactionGateway {
  @WebSocketServer()
  server: Server;

  emitPaymentConfirmed(data: { 
    transactionId: number; 
    bookingId?: number;
    userMembershipId?: number;
    status: string;
    totalPrice: number;
  }) {
    this.server.emit('payment_confirmed', data);
  }

  emitPaymentFailed(data: { 
    transactionId: number; 
    reason: string;
  }) {
    this.server.emit('payment_failed', data);
  }
}