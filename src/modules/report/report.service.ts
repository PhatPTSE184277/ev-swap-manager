import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from 'src/entities/report.entity';
import { DataSource, In, Like, Repository } from 'typeorm';
import { CreateReportDto } from './dto/create-report.dto';
import { Battery, Booking, BookingDetail } from 'src/entities';
import { ReportStatus } from 'src/enums/report.enum';
import { BatteryStatus, RoleName } from 'src/enums';

@Injectable()
export class ReportService {
    constructor(
        @InjectRepository(Report)
        private readonly reportRepository: Repository<Report>,
        @InjectRepository(BookingDetail)
        private readonly bookingDetailRepository: Repository<BookingDetail>,
        @InjectRepository(Booking)
        private readonly bookingRepository: Repository<Booking>,
        private readonly dataSource: DataSource
    ) {}

    async createReport(userId: number, dto: CreateReportDto): Promise<any> {
        try {
            const bookingDetail = await this.bookingDetailRepository.findOne({
                where: { id: dto.bookingDetailId }
            });

            if (!bookingDetail) {
                throw new NotFoundException('Chi tiết đặt chỗ không tồn tại');
            }

            const existedReport = await this.reportRepository.findOne({
                where: { bookingDetailId: dto.bookingDetailId }
            });
            if (existedReport) {
                throw new BadRequestException(
                    'Bạn đã báo cáo lỗi cho lần đổi pin này'
                );
            }

            const report = this.reportRepository.create({
                bookingDetailId: dto.bookingDetailId,
                userId: userId,
                description: dto.description,
                status: ReportStatus.PENDING,
                faultyBatteryId: bookingDetail.batteryId
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

            const where: any = { bookingDetailId: In(ids) };
            if (status) where.status = status;
            if (search) where.description = Like(`%${search}%`);

            const [reports, total] = await this.reportRepository.findAndCount({
                where,
                relations: ['bookingDetail', 'user'],
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: 'DESC' }
            });

            const safeReports = reports.map((report) => ({
                ...report,
                user: report.user
                    ? {
                          id: report.user.id,
                          username: report.user.username,
                          email: report.user.email,
                          fullName: report.user.fullName,
                          avatar: report.user.avatar,
                          status: report.user.status,
                          roleId: report.user.roleId,
                          createdAt: report.user.createdAt,
                          updatedAt: report.user.updatedAt
                      }
                    : null
            }));

            return {
                data: safeReports,
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
        userRole: RoleName,
        search?: string,
        status?: ReportStatus
    ): Promise<{
        data: any[];
        message: string;
    }> {
        try {
            if (userRole === RoleName.USER) {
                const booking = await this.bookingRepository.findOne({
                    where: { id: bookingId },
                    relations: ['userVehicle']
                });

                if (!booking || booking.userVehicle?.userId !== userId) {
                    throw new BadRequestException(
                        'Bạn không có quyền xem báo cáo của booking này'
                    );
                }
            }

            const bookingDetails = await this.bookingDetailRepository.find({
                where: { bookingId }
            });
            const ids = bookingDetails.map((bd) => bd.id);

            if (ids.length === 0) {
                return {
                    data: [],
                    message: 'Không có báo cáo nào cho booking này'
                };
            }

            const where: any = { bookingDetailId: In(ids) };
            if (userRole === RoleName.USER) where.userId = userId;
            if (status) where.status = status;
            if (search) where.description = Like(`%${search}%`);

            const reports = await this.reportRepository.find({
                where,
                relations: ['bookingDetail', 'user'],
                order: { createdAt: 'DESC' }
            });

            const safeReports = reports.map((report) => ({
                ...report,
                user: report.user
                    ? {
                          id: report.user.id,
                          username: report.user.username,
                          email: report.user.email,
                          fullName: report.user.fullName,
                          avatar: report.user.avatar,
                          status: report.user.status,
                          roleId: report.user.roleId,
                          createdAt: report.user.createdAt,
                          updatedAt: report.user.updatedAt
                      }
                    : null
            }));

            return {
                data: safeReports,
                message: 'Lấy danh sách báo cáo theo booking thành công'
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

    async confirmReport(reportId: number): Promise<any> {
        try {
            return await this.dataSource.transaction(async (manager) => {
                const report = await manager.findOne(Report, {
                    where: { id: reportId },
                    relations: ['bookingDetail']
                });
                if (!report) {
                    throw new NotFoundException('Báo cáo không tồn tại');
                }

                if (report.status !== ReportStatus.PENDING) {
                    throw new BadRequestException('Báo cáo đã được xử lý');
                }

                // Đánh dấu pin bị lỗi
                const bookingDetail = report.bookingDetail;
                if (bookingDetail && bookingDetail.batteryId) {
                    const battery = await manager.findOne(Battery, {
                        where: { id: bookingDetail.batteryId }
                    });
                    if (battery) {
                        battery.status = BatteryStatus.DAMAGED;
                        await manager.update(Battery, battery.id, battery);
                        report.faultyBatteryId = battery.id;
                    }
                }

                report.status = ReportStatus.CONFIRMED;
                await manager.update(Report, report.id, report);

                return {
                    message:
                        'Xác nhận báo cáo thành công. User được phép đổi pin miễn phí tại trạm.'
                };
            });
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }

            throw new InternalServerErrorException('Lỗi khi xác nhận báo cáo');
        }
    }

    async rejectReport(reportId: number): Promise<any> {
        try {
            const report = await this.reportRepository.findOne({
                where: { id: reportId }
            });
            if (!report) {
                throw new NotFoundException('Báo cáo không tồn tại');
            }

            if (report.status !== ReportStatus.PENDING) {
                throw new BadRequestException('Báo cáo đã được xử lý');
            }

            await this.reportRepository.update(reportId, {
                status: ReportStatus.REJECTED
            });
            return { message: 'Từ chối báo cáo thành công' };
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }
            throw new InternalServerErrorException('Lỗi khi từ chối báo cáo');
        }
    }
}
