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
import { Between, DataSource, Repository } from 'typeorm';

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

    async getTransactionChart(
        from: Date,
        to: Date,
        stationId?: number
    ): Promise<any[]> {
        try {
            const fromStr = from.toISOString().slice(0, 10);
            const toStr = to.toISOString().slice(0, 10);

            const [fromY, fromM, fromD] = fromStr.split('-').map(Number);
            const [toY, toM, toD] = toStr.split('-').map(Number);

            const startDate = new Date(fromY, fromM - 1, fromD, 0, 0, 0, 0);
            const endDate = new Date(toY, toM - 1, toD, 23, 59, 59, 999);

            let transactions;

            if (stationId) {
                // Filter theo stationId nếu có
                transactions = await this.transactionRepository
                    .createQueryBuilder('transaction')
                    .innerJoin('transaction.booking', 'booking')
                    .where('booking.stationId = :stationId', { stationId })
                    .andWhere('transaction.status = :status', {
                        status: TransactionStatus.SUCCESS
                    })
                    .andWhere('transaction.createdAt >= :from', {
                        from: startDate
                    })
                    .andWhere('transaction.createdAt <= :to', { to: endDate })
                    .getMany();
            } else {
                // Lấy tất cả transaction SUCCESS
                transactions = await this.transactionRepository.find({
                    where: {
                        status: TransactionStatus.SUCCESS,
                        createdAt: Between(startDate, endDate)
                    }
                });
            }

            // Gom nhóm theo ngày
            const result: Record<string, number> = {};
            transactions.forEach((tran) => {
                // Format date về local timezone
                const tranDate = new Date(tran.createdAt);
                const dateStr = `${tranDate.getFullYear()}-${String(tranDate.getMonth() + 1).padStart(2, '0')}-${String(tranDate.getDate()).padStart(2, '0')}`;
                result[dateStr] = (result[dateStr] || 0) + 1;
            });

            // Tạo mảng tất cả ngày trong khoảng
            const days: string[] = [];
            const current = new Date(fromY, fromM - 1, fromD);
            const end = new Date(toY, toM - 1, toD);

            while (current <= end) {
                const dayStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
                days.push(dayStr);
                current.setDate(current.getDate() + 1);
            }

            // Trả về mảng cho chart
            return days.map((date) => ({
                date,
                total: result[date] || 0
            }));
        } catch (error) {
            throw new InternalServerErrorException(
                'Lỗi khi lấy dữ liệu transaction chart'
            );
        }
    }

    async getRevenueChart(
        from: Date,
        to: Date,
        stationId?: number
    ): Promise<any[]> {
        try {
            // Parse date string đúng cách, tránh lệch timezone
            const fromStr = from.toISOString().slice(0, 10);
            const toStr = to.toISOString().slice(0, 10);

            // Tạo date object từ string YYYY-MM-DD (local time)
            const [fromY, fromM, fromD] = fromStr.split('-').map(Number);
            const [toY, toM, toD] = toStr.split('-').map(Number);

            const startDate = new Date(fromY, fromM - 1, fromD, 0, 0, 0, 0);
            const endDate = new Date(toY, toM - 1, toD, 23, 59, 59, 999);

            let transactions;

            if (stationId) {
                // Filter theo stationId nếu có
                transactions = await this.transactionRepository
                    .createQueryBuilder('transaction')
                    .innerJoin('transaction.booking', 'booking')
                    .where('booking.stationId = :stationId', { stationId })
                    .andWhere('transaction.status = :status', {
                        status: TransactionStatus.SUCCESS
                    })
                    .andWhere('transaction.createdAt >= :from', {
                        from: startDate
                    })
                    .andWhere('transaction.createdAt <= :to', { to: endDate })
                    .getMany();
            } else {
                // Lấy tất cả transaction SUCCESS
                transactions = await this.transactionRepository.find({
                    where: {
                        status: TransactionStatus.SUCCESS,
                        createdAt: Between(startDate, endDate)
                    }
                });
            }

            // Gom nhóm doanh thu theo ngày
            const revenueByDate: Record<string, number> = {};
            transactions.forEach((tran) => {
                // Format date về local timezone
                const tranDate = new Date(tran.createdAt);
                const dateStr = `${tranDate.getFullYear()}-${String(tranDate.getMonth() + 1).padStart(2, '0')}-${String(tranDate.getDate()).padStart(2, '0')}`;
                revenueByDate[dateStr] =
                    (revenueByDate[dateStr] || 0) +
                    Number(tran.totalPrice || 0);
            });

            // Tạo mảng tất cả ngày trong khoảng
            const days: string[] = [];
            const current = new Date(fromY, fromM - 1, fromD);
            const end = new Date(toY, toM - 1, toD);

            while (current <= end) {
                const dayStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
                days.push(dayStr);
                current.setDate(current.getDate() + 1);
            }

            // Trả về mảng cho chart (mỗi ngày với doanh thu)
            return days.map((date) => ({
                date,
                revenue: revenueByDate[date] || 0
            }));
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

    async getUserMembershipStatsByMonthYear(
        month: number,
        year: number
    ): Promise<any> {
        try {
            // Lấy tất cả user có role USER
            const allUsers = await this.userRepository.find({
                where: { role: { name: RoleName.USER } },
                relations: ['userMemberships', 'userMemberships.membership']
            });

            // Lấy tất cả membership
            const allMemberships = await this.membershipRepository.find({
                where: { status: true }
            });

            // Xác định userMembership ACTIVE duy nhất theo tháng/năm (lấy bản ghi ACTIVE, createdAt trong tháng/năm)
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 1);

            // Map userId -> membershipId (chỉ lấy bản ghi ACTIVE, createdAt trong tháng/năm, expiredDate chưa hết hạn)
            const userMainMembership: Record<number, number | null> = {};

            allUsers.forEach((user) => {
                const activeMemberships = user.userMemberships
                    ?.filter(
                        (um) =>
                            um.status === UserMembershipStatus.ACTIVE &&
                            um.createdAt >= startDate &&
                            um.createdAt < endDate
                    )
                    .sort((a, b) => {
                        // Ưu tiên expiredDate xa nhất
                        const aTime = a.expiredDate
                            ? new Date(a.expiredDate).getTime()
                            : 0;
                        const bTime = b.expiredDate
                            ? new Date(b.expiredDate).getTime()
                            : 0;
                        return bTime - aTime;
                    });
                userMainMembership[user.id] =
                    activeMemberships && activeMemberships.length > 0
                        ? activeMemberships[0].membershipId
                        : null;
            });

            // Đếm số user chưa đăng ký gói (không có gói ACTIVE trong tháng/năm)
            const usersWithoutMembership = Object.values(
                userMainMembership
            ).filter((mId) => mId === null).length;

            // Đếm số user đăng ký từng loại gói (mỗi user chỉ tính 1 gói ACTIVE trong tháng/năm)
            const membershipStats = allMemberships.map((membership) => {
                const count = Object.values(userMainMembership).filter(
                    (mId) => mId === membership.id
                ).length;

                return {
                    membershipId: membership.id,
                    membershipName: membership.name,
                    price: membership.price,
                    userCount: count
                };
            });

            // Tổng user đã đăng ký (có 1 gói ACTIVE trong tháng/năm)
            const usersWithMembership = Object.values(
                userMainMembership
            ).filter((mId) => mId !== null).length;

            return {
                totalUsers: allUsers.length,
                usersWithoutMembership,
                usersWithMembership,
                membershipStats,
                message: `Lấy thống kê gói thành viên tháng ${month}/${year} thành công`
            };
        } catch (error) {
            throw new InternalServerErrorException(
                'Lỗi khi lấy thống kê gói thành viên theo tháng/năm'
            );
        }
    }
}
