import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from 'src/entities/report.entity';
import { DataSource, Like, Repository } from 'typeorm';
import { CreateReportDto } from './dto/create-report.dto';
import { BookingDetail } from 'src/entities';
import { ReportStatus } from 'src/enums/report.enum';

@Injectable()
export class ReportService {
    constructor(
        @InjectRepository(Report)
        private readonly reportRepository: Repository<Report>,
        @InjectRepository(BookingDetail)
        private readonly bookingDetailRepository: Repository<BookingDetail>
    ) {}

    async createReport(userId: number, dto: CreateReportDto): Promise<any> {
        try {
            const bookingDetail = await this.bookingDetailRepository.findOne({
                where: { id: dto.bookingDetailId }
            });

            if (!bookingDetail) {
                throw new NotFoundException('Chi tiết đặt chỗ không tồn tại');
            }

            const report = this.reportRepository.create({
                bookingDetailId: dto.bookingDetailId,
                userId: userId,
                description: dto.description
            });
            await this.reportRepository.save(report);
            return { message: 'Tạo báo cáo thành công' };
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }

            throw new InternalServerErrorException('Lỗi khi tạo báo cáo');
        }
    }

    async getReportsByStation(
        stationId: number,
        page: number = 1,
        limit: number = 10,
        search?: string,
        status?: ReportStatus
    ): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        message: string;
    }> {
        try {
            const bookingDetailIds = await this.bookingDetailRepository
                .createQueryBuilder('bd')
                .innerJoin('bd.booking', 'b')
                .where('b.stationId = :stationId', { stationId })
                .select('bd.id')
                .getRawMany();

            const ids = bookingDetailIds.map((item) => item.bd_id);
            if (ids.length === 0) {
                return {
                    data: [],
                    total: 0,
                    page,
                    limit,
                    message: 'Không có báo cáo nào tại trạm này'
                };
            }

            const where: any = { bookingDetailId: ids };
            if (status) where.status = status;
            if (search) where.description = Like(`%${search}%`);

            const [reports, total] = await this.reportRepository.findAndCount({
                where,
                relations: ['bookingDetail', 'user'],
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: 'DESC' }
            });

            return {
                data: reports,
                total,
                page,
                limit,
                message: 'Lấy danh sách báo cáo theo trạm thành công'
            };
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }
            throw new InternalServerErrorException(
                'Lỗi khi lấy danh sách báo cáo'
            );
        }
    }

    async getReportsByUserBooking(
        userId: number,
        bookingId: number,
        page: number = 1,
        limit: number = 10,
        search?: string,
        status?: ReportStatus
    ): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        message: string;
    }> {
        try {
            const bookingDetails = await this.bookingDetailRepository.find({
                where: { bookingId }
            });
            const ids = bookingDetails.map((bd) => bd.id);
            if (ids.length === 0) {
                return {
                    data: [],
                    total: 0,
                    page,
                    limit,
                    message: 'Không có báo cáo nào cho booking này'
                };
            }

            const where: any = { bookingDetailId: ids, userId };
            if (status) where.status = status;
            if (search) where.description = Like(`%${search}%`);

            const [reports, total] = await this.reportRepository.findAndCount({
                where,
                relations: ['bookingDetail'],
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: 'DESC' }
            });

            return {
                data: reports,
                total,
                page,
                limit,
                message:
                    'Lấy danh sách báo cáo theo booking của user thành công'
            };
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }
            throw new InternalServerErrorException(
                'Lỗi khi lấy danh sách báo cáo'
            );
        }
    }
}
