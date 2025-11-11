import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    Station,
    User,
    Booking,
    UserMembership,
    Transaction,
    Feedback
} from 'src/entities';
import {
    RoleName,
    BookingStatus,
    UserMembershipStatus,
    TransactionStatus
} from 'src/enums';
import { Between, DataSource, LessThan, MoreThanOrEqual, Repository } from 'typeorm';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Station)
        private readonly stationRepository: Repository<Station>,
        @InjectRepository(Booking)
        private readonly bookingRepository: Repository<Booking>,
        @InjectRepository(UserMembership)
        private readonly userMembershipRepository: Repository<UserMembership>,
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        private readonly dataSource: DataSource
    ) {}

    async countUsers(): Promise<any> {
        try {
            const countUsers = await this.userRepository.count({
                where: {
                    role: { name: RoleName.USER }
                }
            });
            return { countUsers, message: 'Lấy số lượng user thành công' };
        } catch (error) {
            throw new InternalServerErrorException('Lỗi khi lấy số lượng user');
        }
    }

    async countStations(): Promise<any> {
        try {
            const countStations = await this.stationRepository.count();
            return { countStations, message: 'Lấy số lượng trạm thành công' };
        } catch (error) {
            throw new InternalServerErrorException('Lỗi khi lấy số lượng trạm');
        }
    }

    async countActiveBookingsByMonthYear(
        month: number,
        year: number
    ): Promise<any> {
        try {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 1);

            const count = await this.bookingRepository.count({
                where: {
                    status: BookingStatus.COMPLETED,
                    createdAt: Between(startDate, endDate)
                }
            });

            return {
                count,
                message: `Số lượng booking COMPLETED trong tháng ${month}/${year}`
            };
        } catch (error) {
            throw new InternalServerErrorException(
                'Lỗi khi đếm booking COMPLETED theo tháng/năm'
            );
        }
    }

    async countActiveUserMembershipsByMonthYear(
        month: number,
        year: number
    ): Promise<any> {
        try {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 1);

            const count = await this.userMembershipRepository.count({
                where: {
                    status: UserMembershipStatus.ACTIVE,
                    createdAt: Between(startDate, endDate)
                }
            });

            return {
                count,
                message: `Số lượng user membership ACTIVE trong tháng ${month}/${year}`
            };
        } catch (error) {
            throw new InternalServerErrorException(
                'Lỗi khi đếm user membership ACTIVE theo tháng/năm'
            );
        }
    }

    async getTransactionChart(from: Date, to: Date): Promise<any[]> {
        try {
            // Lấy tất cả transaction SUCCESS trong khoảng thời gian
            const transactions = await this.transactionRepository.find({
                where: {
                    status: TransactionStatus.SUCCESS,
                    createdAt: Between(from, to)
                }
            });

            // Gom nhóm theo ngày
            const result: Record<string, number> = {};
            transactions.forEach((tran) => {
                const date = tran.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
                result[date] = (result[date] || 0) + 1;
            });

            // Trả về mảng cho chart
            return Object.keys(result)
                .sort()
                .map((date) => ({
                    date,
                    total: result[date]
                }));
        } catch (error) {
            throw new InternalServerErrorException(
                'Lỗi khi lấy dữ liệu transaction chart'
            );
        }
    }

    async getRevenueChart(year: number): Promise<any[]> {
        try {
            const result: { month: string; revenue: number }[] = [];
            for (let m = 0; m < 12; m++) {
                const start = new Date(year, m, 1);
                const end = new Date(year, m + 1, 1);

                const transactions = await this.transactionRepository.find({
                    where: {
                        status: TransactionStatus.SUCCESS,
                        createdAt: Between(start, end)
                    }
                });

                const revenue = transactions.reduce(
                    (sum, t) => sum + Number(t.totalPrice),
                    0
                );

                result.push({
                    month: `${m + 1}/${year}`,
                    revenue
                });
            }
            return result;
        } catch (error) {
            throw new InternalServerErrorException(
                'Lỗi khi lấy dữ liệu doanh thu chart'
            );
        }
    }

    async getTopStations(): Promise<any> {
        try {
            // Lấy tất cả booking với stationId
            const bookings = await this.bookingRepository.find({
                select: ['stationId'],
                relations: ['station']
            });

            // Đếm số lượng booking theo từng station
            const stationCount: Record<
                number,
                { station: Station; count: number }
            > = {};

            bookings.forEach((booking) => {
                if (booking.stationId) {
                    if (!stationCount[booking.stationId]) {
                        stationCount[booking.stationId] = {
                            station: booking.station,
                            count: 0
                        };
                    }
                    stationCount[booking.stationId].count++;
                }
            });

            // Chuyển thành mảng và sắp xếp
            const sortedStations = Object.values(stationCount).sort(
                (a, b) => b.count - a.count
            );

            // Lấy top 3 nhiều nhất
            const topMost = sortedStations.slice(0, 3).map((item) => ({
                id: item.station.id,
                name: item.station.name,
                address: item.station.address,
                bookingCount: item.count
            }));

            // Lấy top 3 ít nhất
            const topLeast = sortedStations
                .slice(-3)
                .reverse()
                .map((item) => ({
                    id: item.station.id,
                    name: item.station.name,
                    address: item.station.address,
                    bookingCount: item.count
                }));

            return {
                topMost,
                topLeast,
                message: 'Lấy top trạm thành công'
            };
        } catch (error) {
            throw new InternalServerErrorException('Lỗi khi lấy top trạm');
        }
    }

    async getTopFeedbackStations(): Promise<any> {
        try {
            // Lấy tất cả feedbacks có stationId
            const feedbacks = await this.dataSource
                .getRepository(Feedback)
                .find({
                    relations: ['station']
                });

            // Đếm số lượng feedback theo từng station
            const stationCount: Record<
                number,
                { station: any; count: number }
            > = {};
            feedbacks.forEach((fb) => {
                if (fb.stationId) {
                    if (!stationCount[fb.stationId]) {
                        stationCount[fb.stationId] = {
                            station: fb.station,
                            count: 0
                        };
                    }
                    stationCount[fb.stationId].count++;
                }
            });

            // Chuyển thành mảng và sắp xếp giảm dần
            const sortedStations = Object.values(stationCount).sort(
                (a, b) => b.count - a.count
            );

            // Lấy top 3 trạm được feedback nhiều nhất
            const topFeedback = sortedStations.slice(0, 3).map((item) => ({
                id: item.station.id,
                name: item.station.name,
                address: item.station.address,
                feedbackCount: item.count
            }));

            return {
                topFeedback,
                message: 'Lấy top 3 trạm được feedback nhiều nhất thành công'
            };
        } catch (error) {
            throw new InternalServerErrorException(
                'Lỗi khi lấy top feedback trạm'
            );
        }
    }
}
