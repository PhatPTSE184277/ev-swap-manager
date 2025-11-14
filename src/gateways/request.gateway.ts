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
    batteryId: number;
    currentStationId: number;
    newStationId: number;
    status: string;
  }) {
    this.server.emit('request_created', data);
  }

  emitRequestUpdated(data: { 
    requestId: number; 
    status: string;
  }) {
    this.server.emit('request_updated', data);
  }
}