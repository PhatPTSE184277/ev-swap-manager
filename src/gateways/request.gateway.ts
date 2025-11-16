import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true, namespace: '/request' })
export class RequestGateway {
  @WebSocketServer()
  server: Server;

  emitRequestCreated(data: {
    requestId: number;
    stationId: number;
    batteryTypeId: number;
    requestedQuantity: number;
    status: string;
  }) {
    this.server.emit('request_created', data);
  }

  emitRequestAccepted(data: {
    requestId: number;
    stationId: number;
    approvedQuantity: number;
    requestedQuantity: number;
    note?: string;
  }) {
    this.server.emit('request_accepted', data);
  }

  emitRequestRejected(data: {
    requestId: number;
    stationId: number;
    note?: string;
  }) {
    this.server.emit('request_rejected', data);
  }
}