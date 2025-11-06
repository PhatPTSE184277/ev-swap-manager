import {
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { QrGateway } from 'src/gateways/qr.gateway';
import { BookingService } from '../booking/booking.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Station } from 'src/entities';
import { Repository } from 'typeorm';

interface QrSession {
    id: string;
    stationId: number;
    status: 'PENDING' | 'APPROVED' | 'EXPIRED';
    createdAt: Date;
    expiredAt: Date;
    userId?: number;
    token?: string;
    bookingId?: number;
}

@Injectable()
export class QrLoginService {
    private readonly logger = new Logger(QrLoginService.name);
    private sessions = new Map<string, QrSession>();

    constructor(
        private readonly jwtService: JwtService,
        private readonly qrGateway: QrGateway,
        private readonly bookingService: BookingService,
        @InjectRepository(Station)
        private readonly stationRepository: Repository<Station>
    ) {}

    async createSession(createSessionDto: CreateSessionDto, ttlSeconds = 60) {
        const id = randomUUID();
        const station = await this.stationRepository.findOne({
            where: { id: createSessionDto.stationId }
        });
        if (!station) {
            throw new NotFoundException('Trạm không tồn tại');
        }
        const session: QrSession = {
            id,
            stationId: createSessionDto.stationId,
            status: 'PENDING',
            createdAt: new Date(),
            expiredAt: new Date(Date.now() + ttlSeconds * 1000)
        };
        this.sessions.set(id, session);
        this.logger.log(
            `Tạo QR session ${id} cho trạm ${createSessionDto.stationId}`
        );
        return {
            sessionId: id,
            expiredAt: session.expiredAt,
            stationId: createSessionDto.stationId
        };
    }

    async approve(sessionId: string, user: any) {
        const session = this.sessions.get(sessionId);
        if (!session) throw new NotFoundException('QR session không tồn tại');
        if (session.status !== 'PENDING')
            throw new UnauthorizedException('QR session không hợp lệ');
        if (session.expiredAt < new Date()) {
            session.status = 'EXPIRED';
            this.qrGateway.notifyExpired(sessionId);
            throw new UnauthorizedException('QR session đã hết hạn');
        }
        let checkinResult: any = null;
        let hasBooking = false;
        try {
            checkinResult = await this.bookingService.checkinBooking(
                user.id,
                session.stationId
            );
            hasBooking = true;
        } catch (error) {
            this.logger.log(
                `User ${user.id} không có booking đặt trước tại trạm ${session.stationId}, cho phép đăng nhập để đặt tại chỗ`
            );
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
        session.bookingId = checkinResult?.bookingId || null;
        this.sessions.set(sessionId, session);

        this.qrGateway.notifyApproved(sessionId, token);
        this.logger.log(`QR session ${sessionId} approved bởi user ${user.id}`);

        return {
            sessionId,
            token,
            hasBooking,
            message: hasBooking
                ? 'Check-in booking thành công'
                : 'Đăng nhập thành công. Vui lòng đặt booking tại trạm',
            ...(checkinResult || {})
        };
    }

    getStatus(sessionId: string) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new NotFoundException('Không tìm thấy QR session');
        }

        if (session.expiredAt < new Date() && session.status === 'PENDING') {
            session.status = 'EXPIRED';
            this.qrGateway.notifyExpired(sessionId);
        }

        return {
            id: session.id,
            stationId: session.stationId,
            status: session.status,
            token: session.status === 'APPROVED' ? session.token : null,
            bookingId: session.status === 'APPROVED' ? session.bookingId : null
        };
    }

    cleanupExpiredSessions() {
        const now = new Date();
        let cleaned = 0;

        for (const [id, session] of this.sessions.entries()) {
            if (session.expiredAt < now) {
                this.sessions.delete(id);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            this.logger.log(`Đã xóa ${cleaned} expired QR sessions`);
        }
    }
}
