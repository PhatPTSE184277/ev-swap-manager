import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BatteryUsedHistory } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class BatteryUsedHistoryService {
    constructor(
        @InjectRepository(BatteryUsedHistory)
        private readonly batteryUsedHistoryRepository: Repository<BatteryUsedHistory>
    ) {}

    async findByBatteryId(batteryId: number): Promise<{data: any[], message: string}> {
        const histories = await this.batteryUsedHistoryRepository.find({
            where: { batteryId },
            order: { createdAt: 'DESC' }
        });
        const mappedData = histories.map(
            ({ createdAt, ...rest }) => ({
                ...rest
            })
        );
        return {
            data: mappedData,
            message: 'Lấy lịch sử sử dụng pin thành công'
        };
    }

    async findByUserId(userId: number): Promise<{data: any[], message: string}> {
        const histories = await this.batteryUsedHistoryRepository
            .createQueryBuilder('history')
            .leftJoinAndSelect('history.booking', 'booking')
            .where('booking.userId = :userId', { userId })
            .orderBy('history.createdAt', 'DESC')
            .getMany();
        return {
            data: histories,
            message: 'Lấy lịch sử sử dụng pin thành công'
        };
    }

    async findByBookingId(bookingId: number): Promise<{data: any[], message: string}> {
        const histories = await this.batteryUsedHistoryRepository.find({
            where: { bookingId },
            order: { createdAt: 'DESC' }
        });
        const mappedData = histories.map(
            ({ createdAt, ...rest }) => ({
                ...rest
            })
        );
        return {
            data: mappedData,
            message: 'Lấy lịch sử sử dụng pin thành công'
        };
    }
}
