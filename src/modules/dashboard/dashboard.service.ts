import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    Station,
    User,
    Booking,
    UserMembership,
    Transaction,
    Feedback,
    Membership
} from 'src/entities';
import {
    RoleName,
    BookingStatus,
    UserMembershipStatus,
    TransactionStatus
} from 'src/enums';
import {
    Between,
    DataSource,
    LessThan,
    MoreThanOrEqual,
    Repository
} from 'typeorm';

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
        @InjectRepository(Membership)
        private readonly membershipRepository: Repository<Membership>,
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
                bookingCount: item.count,
                image: item.station.image
            }));

            // Lấy top 3 ít nhất
            const topLeast = sortedStations
                .slice(-3)
                .reverse()
                .map((item) => ({
                    id: item.station.id,
                    name: item.station.name,
                    address: item.station.address,
                    bookingCount: item.count,
                    image: item.station.image
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

    async getTopAvgRatingStations(): Promise<any> {
        try {
            // Lấy tất cả feedbacks có stationId
            const feedbacks = await this.dataSource
                .getRepository(Feedback)
                .find({ relations: ['station'] });

            // Gom feedback theo stationId
            const stationRatings: Record<
                number,
                { station: Station; total: number; count: number }
            > = {};
            feedbacks.forEach((fb) => {
                if (fb.stationId && fb.station) {
                    if (!stationRatings[fb.stationId]) {
                        stationRatings[fb.stationId] = {
                            station: fb.station,
                            total: 0,
                            count: 0
                        };
                    }
                    stationRatings[fb.stationId].total += fb.rating;
                    stationRatings[fb.stationId].count++;
                }
            });

            // Tính trung bình rating cho từng station
            const avgRatings = Object.values(stationRatings)
                .map((item) => ({
                    id: item.station.id,
                    name: item.station.name,
                    address: item.station.address,
                    image: item.station.image,
                    avgRating: item.count > 0 ? item.total / item.count : 0,
                    feedbackCount: item.count
                }))
                .filter((item) => item.feedbackCount > 0);

            if (avgRatings.length === 0) {
                return {
                    highest: null,
                    lowest: null,
                    message: 'Không có dữ liệu feedback'
                };
            }

            // Sắp xếp giảm dần theo avgRating
            avgRatings.sort((a, b) => b.avgRating - a.avgRating);

            const highest = avgRatings[0];
            const lowest = avgRatings[avgRatings.length - 1];

            return {
                highest,
                lowest,
                message:
                    'Lấy trạm rating trung bình cao nhất và thấp nhất thành công'
            };
        } catch (error) {
            throw new InternalServerErrorException(
                'Lỗi khi lấy trạm rating trung bình cao/thấp nhất'
            );
        }
    }

    async getUserMembershipStats(): Promise<any> {
        try {
            // Lấy tất cả user có role USER
            const allUsers = await this.userRepository.find({
                where: {
                    role: { name: RoleName.USER }
                },
                relations: ['userMemberships', 'userMemberships.membership']
            });

            // Lấy tất cả membership
            const allMemberships = await this.membershipRepository.find({
                where: { status: true }
            });

            // Đếm số user chưa đăng ký gói (không có userMembership ACTIVE nào)
            const usersWithoutMembership = allUsers.filter((user) => {
                const hasActiveMembership = user.userMemberships?.some(
                    (um) => um.status === UserMembershipStatus.ACTIVE
                );
                return !hasActiveMembership;
            });

            // Đếm số user đăng ký từng loại gói
            const membershipStats = allMemberships.map((membership) => {
                const count = allUsers.filter((user) => {
                    return user.userMemberships?.some(
                        (um) =>
                            um.membershipId === membership.id &&
                            um.status === UserMembershipStatus.ACTIVE
                    );
                }).length;

                return {
                    membershipId: membership.id,
                    membershipName: membership.name,
                    price: membership.price,
                    userCount: count
                };
            });

            // Tính tổng user đã đăng ký (có ít nhất 1 gói ACTIVE)
            const usersWithMembership = allUsers.filter((user) => {
                return user.userMemberships?.some(
                    (um) => um.status === UserMembershipStatus.ACTIVE
                );
            });

            return {
                totalUsers: allUsers.length,
                usersWithoutMembership: usersWithoutMembership.length,
                usersWithMembership: usersWithMembership.length,
                membershipStats,
                message: 'Lấy thống kê gói thành viên thành công'
            };
        } catch (error) {
            throw new InternalServerErrorException(
                'Lỗi khi lấy thống kê gói thành viên'
            );
        }
    }
}
