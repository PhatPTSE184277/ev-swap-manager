import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction, Booking } from 'src/entities';
import { TransactionStatus } from 'src/enums';
import { Between, Repository } from 'typeorm';

@Injectable()
export class StaffDashboardService {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        @InjectRepository(Booking)
        private readonly bookingRepository: Repository<Booking>
    ) {}

    async getTransactionChartByStation(
        stationId: number,
        from: Date,
        to: Date
    ): Promise<any[]> {
        try {
            // Lấy tất cả bookingId của trạm này
            const bookings = await this.bookingRepository.find({
                where: { stationId },
                select: ['id']
            });

            const bookingIds = bookings.map((b) => b.id);

            if (bookingIds.length === 0) {
                // Không có booking nào, trả về mảng ngày với total = 0
                const days: string[] = [];
                const current = new Date(from);
                while (current <= to) {
                    const dayStr = current.toISOString().slice(0, 10);
                    days.push(dayStr);
                    current.setDate(current.getDate() + 1);
                }
                return days.map((date) => ({ date, total: 0 }));
            }

            // Lấy tất cả transaction SUCCESS liên quan đến booking của trạm này
            const transactions = await this.transactionRepository
                .createQueryBuilder('transaction')
                .innerJoin('transaction.booking', 'booking')
                .where('booking.stationId = :stationId', { stationId })
                .andWhere('transaction.status = :status', {
                    status: TransactionStatus.SUCCESS
                })
                .andWhere('transaction.createdAt BETWEEN :from AND :to', {
                    from,
                    to
                })
                .getMany();

            // Gom nhóm theo ngày
            const result: Record<string, number> = {};
            transactions.forEach((tran) => {
                const date = tran.createdAt.toISOString().slice(0, 10);
                result[date] = (result[date] || 0) + 1;
            });

            // Tạo mảng tất cả ngày trong khoảng
            const days: string[] = [];
            const current = new Date(from);
            while (current <= to) {
                const dayStr = current.toISOString().slice(0, 10);
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
                'Lỗi khi lấy dữ liệu transaction chart theo trạm'
            );
        }
    }

    async getRevenueChartByStation(
    stationId: number,
    year: number
): Promise<any[]> {
    try {
        const result: { month: string; revenue: number }[] = [];
        
        for (let m = 0; m < 12; m++) {
            const start = new Date(year, m, 1);
            const end = new Date(year, m + 1, 1);

            // Lấy tất cả transaction SUCCESS của trạm trong tháng
            const transactions = await this.transactionRepository
                .createQueryBuilder('transaction')
                .innerJoin('transaction.booking', 'booking')
                .where('booking.stationId = :stationId', { stationId })
                .andWhere('transaction.status = :status', {
                    status: TransactionStatus.SUCCESS
                })
                .andWhere('transaction.createdAt BETWEEN :start AND :end', {
                    start,
                    end
                })
                .getMany();

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
            'Lỗi khi lấy dữ liệu doanh thu chart theo trạm'
        );
    }
}
}