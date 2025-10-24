import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StationStaff, StationStaffHistory } from 'src/entities';
import { DataSource, In, Like, Repository } from 'typeorm';
import { CreateStationStaffDto } from './dto/create-staff.dto';
import { StaffHistoryShift } from 'src/enums/station.enum';

@Injectable()
export class StationStaffService {
    constructor(
        @InjectRepository(StationStaff)
        private readonly stationStaffRepository: Repository<StationStaff>,
        @InjectRepository(StationStaffHistory)
        private readonly stationStaffHistoryRepository: Repository<StationStaffHistory>,
        private readonly dataSource: DataSource
    ) {}

    async getAllStationStaff(
        page: number = 1,
        limit: number = 10,
        search?: string,
        status?: boolean,
        stationId?: number,
        isHead?: boolean
    ): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        message: string;
    }> {
        const where: any = {};
        if (typeof status === 'boolean') where.status = status;
        if (typeof stationId === 'number') where.stationId = stationId;
        if (typeof isHead === 'boolean') where.isHead = isHead;

        if (search) {
            where.user = { fullName: Like(`%${search}%`) };
        }

        const [data, total] = await this.stationStaffRepository.findAndCount({
            where,
            relations: ['user', 'station'],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' }
        });

        const mappedData = data.map(
            ({
                user,
                station,
                createdAt,
                updatedAt,
                userId,
                stationId,
                ...rest
            }) => ({
                ...rest,
                user: {
                    id: user.id,
                    fullName: user.fullName
                },
                station: {
                    id: station.id,
                    name: station.name
                }
            })
        );

        return {
            data: mappedData,
            total,
            page,
            limit,
            message: 'Lấy danh sách nhân viên trạm thành công'
        };
    }

    async getStationStaffByStation(
        stationId: number,
        page: number = 1,
        limit: number = 10,
        search?: string,
        status?: boolean
    ): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        message: string;
    }> {
        const where: any = { stationId };
        if (typeof status === 'boolean') where.status = status;
        where.isHead = false;

        if (search) {
            where.user = { fullName: Like(`%${search}%`) };
        }

        const [data, total] = await this.stationStaffRepository.findAndCount({
            where,
            relations: ['user', 'station'],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' }
        });

        const mappedData = data.map(
            ({
                user,
                station,
                createdAt,
                updatedAt,
                userId,
                stationId,
                ...rest
            }) => ({
                ...rest,
                user: {
                    id: user.id,
                    fullName: user.fullName,
                    username: user.username
                },
                station: {
                    id: station.id,
                    name: station.name,
                    address: station.address
                }
            })
        );

        return {
            data: mappedData,
            total,
            page,
            limit,
            message: 'Lấy danh sách nhân viên của trạm thành công'
        };
    }

    async findByUserId(userId: number): Promise<StationStaff | null> {
        return await this.stationStaffRepository.findOne({
            where: { userId }
        });
    }

    async createStationStaff(
        createStationStaffDto: CreateStationStaffDto
    ): Promise<{
        message: string;
    }> {
        try {
            const result = await this.dataSource.transaction(
                async (manager) => {
                    const staff = manager.create(StationStaff, {
                        userId: createStationStaffDto.userId,
                        stationId: createStationStaffDto.stationId,
                        isHead: createStationStaffDto.isHead ?? false,
                        status: true
                    });
                    await manager.save(StationStaff, staff);

                    const historyData = createStationStaffDto.history
                        ? {
                              ...createStationStaffDto.history,
                              stationStaffId: staff.id,
                              stationId: createStationStaffDto.stationId
                          }
                        : {
                              stationStaffId: staff.id,
                              stationId: createStationStaffDto.stationId,
                              date: new Date(),
                              shift: StaffHistoryShift.MORNING,
                              status: true
                          };

                    const staffHistory = manager.create(
                        StationStaffHistory,
                        historyData
                    );
                    await manager.save(StationStaffHistory, staffHistory);

                    return {
                        message: 'Tạo nhân viên trạm và lịch sử thành công'
                    };
                }
            );

            return result;
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }
            throw new InternalServerErrorException(
                'Tạo nhân viên trạm thất bại'
            );
        }
    }
}
