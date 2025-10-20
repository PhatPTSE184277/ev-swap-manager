import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
@WebSocketGateway({ cors: true, namespace: '/qr' })
export class QrGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(QrGateway.name);
  @WebSocketServer() server: Server;

  private clients = new Map<string, Socket>();

  handleConnection(client: Socket) {
    const sessionId = client.handshake.query?.sessionId as string;
    if (!sessionId) {
      this.logger.warn(`Client thiếu sessionId -> disconnect`);
      client.disconnect();
      return;
    }
    this.clients.set(sessionId, client);
    this.logger.log(`Client connected (sessionId=${sessionId})`);
  }

  handleDisconnect(client: Socket) {
    const entry = [...this.clients.entries()].find(
      ([, sock]) => sock.id === client.id,
    );
    if (entry) {
      const [sessionId] = entry;
      this.clients.delete(sessionId);
      this.logger.log(`Client disconnected (sessionId=${sessionId})`);
    }
  }

  notifyApproved(sessionId: string, token: string) {
    const client = this.clients.get(sessionId);
    if (client) {
      client.emit('qr_approved', { token });
      client.disconnect(true);
      this.clients.delete(sessionId);
      this.logger.log(`QR approved emitted for ${sessionId}`);
    }
  }

  notifyExpired(sessionId: string) {
    const client = this.clients.get(sessionId);
    if (client) {
      client.emit('qr_expired', { message: 'QR expired' });
      client.disconnect(true);
      this.clients.delete(sessionId);
    }
  }
}
