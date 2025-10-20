import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
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
    this.logger.log(`🔌 Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const entry = [...this.clients.entries()].find(
      ([, sock]) => sock.id === client.id,
    );
    if (entry) {
      const [sessionId] = entry;
      this.clients.delete(sessionId);
    }
  }

  // ✅ Khi client join với sessionId
  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { sessionId } = data;
    if (!sessionId) {
      this.logger.warn('⚠️ Client thiếu sessionId khi join');
      client.disconnect();
      return;
    }

    this.clients.set(sessionId, client);
  }

  // ✅ Gửi sự kiện khi QR được duyệt
  notifyApproved(sessionId: string, token: string) {
    const client = this.clients.get(sessionId);
    if (client) {
      client.emit('qr_approved', { token });
      client.disconnect(true);
      this.clients.delete(sessionId);
    } else {
      this.logger.warn(`⚠️ Không tìm thấy client cho sessionId=${sessionId}`);
    }
  }

  // ✅ Gửi sự kiện khi QR hết hạn
  notifyExpired(sessionId: string) {
    const client = this.clients.get(sessionId);
    if (client) {
      client.emit('qr_expired', { message: 'QR expired' });
      client.disconnect(true);
      this.clients.delete(sessionId);
    }
  }
}
