import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true, namespace: '/slot' })
export class SlotGateway {
  @WebSocketServer()
  server: Server;

  emitSlotReserved(data: { slotId: number; stationId: number }) {
    this.server.emit('slot_reserved', data);
  }

  emitSlotAvailable(data: { slotId: number; stationId: number }) {
    this.server.emit('slot_available', data);
  }
}