import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking, BookingDetail, Transaction } from 'src/entities';
import { BookingDetailStatus, BookingStatus, TransactionStatus } from 'src/enums';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class AnalyticService {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        @InjectRepository(Booking)
        private readonly bookingRepository: Repository<Booking>,
        private readonly dataSource: DataSource
    ) {}

    async getTotalRevenueByDate(date: string): Promise<number> {
        const start = new Date(date + 'T00:00:00.000Z');
        const end = new Date(date + 'T23:59:59.999Z');
        const result = await this.transactionRepository
            .createQueryBuilder('transaction')
            .select('SUM(transaction.totalPrice)', 'total')
            .where('transaction.dateTime BETWEEN :start AND :end', {
                start,
                end
            })
            .andWhere('transaction.status = :status', {
                status: TransactionStatus.SUCCESS
            })
            .getRawOne();
        return Number(result.total) || 0;
    }

  async countBookingsByStation(): Promise<
    { stationId: number; count: number }[]
> {
    const result = await this.bookingRepository
        .createQueryBuilder('booking')
        .select('booking.stationId', 'stationId')
        .addSelect('COUNT(*)', 'count')
        .where('booking.status = :status', { status: BookingStatus.COMPLETED })
        .groupBy('booking.stationId')
        .getRawMany();
    return result.map((r) => ({
        stationId: Number(r.stationId),
        count: Number(r.count)
    }));
}

   async countCompletedBookingDetails(): Promise<number> {
    return await this.dataSource.getRepository(BookingDetail).count({
        where: { status: BookingDetailStatus.COMPLETED }
    });
}
}
