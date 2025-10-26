import {
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { QrGateway } from 'src/gateways/qr.gateway';

interface QrSession {
    id: string;
    status: 'PENDING' | 'APPROVED' | 'EXPIRED';
    createdAt: Date;
    expiredAt: Date;
    userId?: number;
    token?: string;
}

@Injectable()
export class QrLoginService {
    private readonly logger = new Logger(QrLoginService.name);
    private sessions = new Map<string, QrSession>();

    constructor(
        private readonly jwtService: JwtService,
        private readonly qrGateway: QrGateway
    ) {}

    createSession(ttlSeconds = 60) {
        const id = randomUUID();
        const session: QrSession = {
            id,
            status: 'PENDING',
            createdAt: new Date(),
            expiredAt: new Date(Date.now() + ttlSeconds * 1000)
        };
        this.sessions.set(id, session);
        this.logger.log(`Tạo QR session ${id}`);
        return { sessionId: id, expiredAt: session.expiredAt };
    }

    approve(sessionId: string, user: any) {
        const session = this.sessions.get(sessionId);
        if (!session) throw new NotFoundException('QR session không tồn tại');
        if (session.status !== 'PENDING')
            throw new UnauthorizedException('QR session không hợp lệ');
        if (session.expiredAt < new Date()) {
            session.status = 'EXPIRED';
            this.qrGateway.notifyExpired(sessionId);
            throw new UnauthorizedException('QR session đã hết hạn');
        }

        const payload = {
            sub: user.id,
            username: user.username,
            role: user.role
        };
        const token = this.jwtService.sign(payload);

        session.status = 'APPROVED';
        session.userId = user.id;
        session.token = token;
        this.sessions.set(sessionId, session);

        this.qrGateway.notifyApproved(sessionId, token);
        this.logger.log(`QR session ${sessionId} approved bởi user ${user.id}`);

        return { sessionId, token };
    }

    getStatus(sessionId: string) {
        const session = this.sessions.get(sessionId);
        if (!session) throw new NotFoundException('Không tìm thấy QR session');
        if (session.expiredAt < new Date() && session.status === 'PENDING') {
            session.status = 'EXPIRED';
            this.qrGateway.notifyExpired(sessionId);
        }
        return {
            id: session.id,
            status: session.status,
            token: session.status === 'APPROVED' ? session.token : null
        };
    }
}
