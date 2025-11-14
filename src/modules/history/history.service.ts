import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StationStaffHistory } from 'src/entities';

@Injectable()
export class HistoryService {
    constructor(
        @InjectRepository(StationStaffHistory)
        private readonly stationStaffHistoryRepository: Repository<StationStaffHistory>
    ) {}

    async getAllStaffHistory(
        page: number = 1,
        limit: number = 10
    ): Promise<any> {
        try {
            const [data, total] =
                await this.stationStaffHistoryRepository.findAndCount({
                    relations: [
                        'stationStaff',
                        'stationStaff.user',
                        'stationStaff.station',
                        'station'
                    ],
                    order: { createdAt: 'DESC' },
                    skip: (page - 1) * limit,
                    take: limit
                });

            const mappedData = data.map((history) => {
                const { createdAt, updatedAt, stationStaff, station, ...rest } = history;
                return {
                    id: rest.id,
                    stationStaffId: rest.stationStaffId,
                    date: rest.date,
                    status: rest.status,
                    user: stationStaff?.user
                        ? {
                              id: stationStaff.user.id,
                              username: stationStaff.user.username,
                              fullName: stationStaff.user.fullName,
                              email: stationStaff.user.email
                          }
                        : null,
                    currentStation: stationStaff?.station
                        ? {
                              id: stationStaff.station.id,
                              name: stationStaff.station.name,
                              address: stationStaff.station.address
                          }
                        : null,
                    newStation: station
                        ? {
                              id: station.id,
                              name: station.name,
                              address: station.address
                          }
                        : null,
                    createdAt
                };
            });

            return {
                success: true,
                message: 'Lấy lịch sử staff thành công',
                data: mappedData,
                total,
                page,
                limit
            };
        } catch (error) {
            throw new InternalServerErrorException(
                'Lỗi khi lấy lịch sử staff'
            );
        }
    }

    async getMyStaffHistory(
        userId: number,
        page: number = 1,
        limit: number = 10
    ): Promise<any> {
        try {
            const [data, total] =
                await this.stationStaffHistoryRepository.findAndCount({
                    where: {
                        stationStaff: {
                            userId
                        }
                    },
                    relations: [
                        'stationStaff',
                        'stationStaff.station',
                        'station'
                    ],
                    order: { createdAt: 'DESC' },
                    skip: (page - 1) * limit,
                    take: limit
                });

            const mappedData = data.map((history) => {
                const { createdAt, updatedAt, stationStaff, station, ...rest } = history;
                return {
                    id: rest.id,
                    stationStaffId: rest.stationStaffId,
                    date: rest.date,
                    status: rest.status,
                    currentStation: stationStaff?.station
                        ? {
                              id: stationStaff.station.id,
                              name: stationStaff.station.name,
                              address: stationStaff.station.address
                          }
                        : null,
                    newStation: station
                        ? {
                              id: station.id,
                              name: station.name,
                              address: station.address
                          }
                        : null,
                    createdAt
                };
            });

            return {
                success: true,
                message: 'Lấy lịch sử của bạn thành công',
                data: mappedData,
                total,
                page,
                limit
            };
        } catch (error) {
            throw new InternalServerErrorException(
                'Lỗi khi lấy lịch sử của bạn'
            );
        }
    }
}