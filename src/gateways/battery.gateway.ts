import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true, namespace: '/battery' })
export class BatteryGateway {
  @WebSocketServer()
  server: Server;

  emitBatteryReserved(data: { batteryId: number; stationId: number }) {
    this.server.emit('battery_reserved', data);
  }

  emitBatteryAvailable(data: { batteryId: number; stationId: number }) {
    this.server.emit('battery_available', data);
  }
}