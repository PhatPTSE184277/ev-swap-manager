/* eslint-disable prefer-const */
import {
    BadRequestException,
    Injectable,
    NotFoundException,
    InternalServerErrorException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Station, Slot, Battery, Cabinet } from 'src/entities';
import { DataSource, In, Like, Repository } from 'typeorm';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { BatteryStatus } from 'src/enums/battery.enum';
import { SlotStatus } from 'src/enums/slot.enum';
import Helpers from '../../utils/helpers';

@Injectable()
export class StationService {
    constructor(
        @InjectRepository(Station)
        private readonly stationRepository: Repository<Station>,
        private readonly dataSource: DataSource,
        @InjectRepository(Cabinet)
        private readonly cabinetRepository: Repository<Cabinet>,
        @InjectRepository(Battery)
        private readonly batteryRepository: Repository<Battery>,
        @InjectRepository(Slot)
        private readonly slotRepository: Repository<Slot>
    ) {}

    async findAll(
        page: number = 1,
        limit: number = 10,
        search?: string,
        order: 'ASC' | 'DESC' = 'ASC',
        status?: boolean
    ): Promise<any> {
        try {
            let where: any = {};
            if (typeof status === 'boolean') where.status = status;
            if (search) where.name = Like(`%${search}%`);

            const [data, total] = await this.stationRepository.findAndCount({
                where,
                order: { name: order },
                skip: (page - 1) * limit,
                take: limit
            });

            const mappedData = data.map((station) => {
                const { createdAt, updatedAt, ...rest } = station;
                return rest;
            });

            return {
                success: true,
                message: 'Lấy danh sách trạm thành công',
                data: mappedData,
                total,
                page,
                limit
            };
        } catch (error) {
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi lấy danh sách trạm'
            );
        }
    }

    async findAllPublic(
        page: number = 1,
        limit: number = 10,
        search?: string,
        order: 'ASC' | 'DESC' = 'ASC',
        status: boolean = true
    ): Promise<any> {
        try {
            let where: any = { status };
            if (search) where.name = Like(`%${search}%`);

            const [data, total] = await this.stationRepository.findAndCount({
                where,
                order: { name: order },
                skip: (page - 1) * limit,
                take: limit
            });

            const mappedData = await Promise.all(
                data.map(async (station) => {
                    const cabinets = await this.cabinetRepository.find({
                        where: { stationId: station.id, status: true }
                    });
                    const cabinetIds = cabinets.map((c) => c.id);
                    const slots = await this.slotRepository.find({
                        where: { cabinetId: In(cabinetIds) }
                    });

                    const slotAvailable = slots.filter(
                        (s) => s.status === SlotStatus.EMPTY
                    ).length;

                    const slotCharging = await Promise.all(
                        slots
                            .filter(
                                (s) =>
                                    s.status === SlotStatus.CHARGING &&
                                    s.batteryId
                            )
                            .map(async (s) => {
                                if (!s.batteryId) return 0;
                                const battery =
                                    await this.batteryRepository.findOne({
                                        where: { id: s.batteryId }
                                    });
                                return battery?.status ===
                                    BatteryStatus.AVAILABLE
                                    ? 1
                                    : 0;
                            })
                    ).then((res) => res.reduce((a, b) => a + b, 0));

                    const { createdAt, updatedAt, status, ...rest } = station;
                    return {
                        ...rest,
                        totalCabinets: cabinets.length,
                        slotAvailable,
                        slotCharging
                    };
                })
            );

            return {
                success: true,
                message: 'Lấy danh sách trạm thành công',
                data: mappedData,
                total,
                page,
                limit
            };
        } catch (error) {
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi lấy danh sách trạm'
            );
        }
    }

    async findById(id: number): Promise<{ data: Station; message: string }> {
        try {
            const station = await this.stationRepository.findOne({
                where: { id }
            });
            if (!station) {
                throw new NotFoundException('Trạm không tồn tại');
            }

            const { createdAt, updatedAt, status, ...rest } = station;
            return {
                data: rest as Station,
                message: 'Lấy thông tin trạm thành công'
            };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi lấy thông tin trạm'
            );
        }
    }

    async create(createStationDto: CreateStationDto): Promise<any> {
        try {
            const result = await this.dataSource.transaction(
                async (manager) => {
                    const existingStation = await manager.findOne(Station, {
                        where: { name: createStationDto.name }
                    });
                    if (existingStation) {
                        throw new BadRequestException('Trạm đã tồn tại');
                    }

                    const newStation = manager.create(
                        Station,
                        createStationDto
                    );
                    await manager.save(Station, newStation);
                    const { createdAt, updatedAt, ...rest } = newStation;
                    return {
                        data: rest,
                        message: 'Tạo trạm thành công'
                    };
                }
            );
            return result;
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi tạo trạm'
            );
        }
    }

    async update(id: number, updateStationDto: UpdateStationDto): Promise<any> {
        try {
            const station = await this.stationRepository.findOne({
                where: { id }
            });
            if (!station) {
                throw new NotFoundException('Trạm không tồn tại');
            }
            if (
                updateStationDto.name &&
                updateStationDto.name !== station.name
            ) {
                const existingStation = await this.stationRepository.findOne({
                    where: { name: updateStationDto.name }
                });
                if (existingStation) {
                    throw new BadRequestException('Trạm đã tồn tại');
                }
            }

            Object.assign(station, updateStationDto);
            await this.stationRepository.update(id, station);
            return {
                message: 'Cập nhật trạm thành công'
            };
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            )
                throw error;
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi cập nhật trạm'
            );
        }
    }

    async softDelete(id: number): Promise<any> {
        try {
            const station = await this.stationRepository.findOne({
                where: { id }
            });
            if (!station) {
                throw new NotFoundException('Trạm không tồn tại');
            }

            if (!station.status) {
                throw new BadRequestException('Trạm đã được xóa trước đó');
            }

            station.status = false;
            await this.stationRepository.save(station);
            return {
                message: 'Xóa trạm thành công'
            };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi xóa trạm'
            );
        }
    }

    async restore(id: number): Promise<any> {
        try {
            const station = await this.stationRepository.findOne({
                where: { id }
            });
            if (!station) {
                throw new NotFoundException('Trạm không tồn tại');
            }
            if (station.status) {
                throw new BadRequestException(
                    'Trạm đã được khôi phục trước đó'
                );
            }
            station.status = true;
            await this.stationRepository.save(station);
            return {
                message: 'Khôi phục trạm thành công'
            };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi khôi phục trạm'
            );
        }
    }

    async findNearestStations(userLat: number, userLng: number, limit = 5) {
        try {
            const stations = await this.stationRepository.find({
                where: { status: true }
            });

            const results = await Promise.all(
                stations.map(async (station) => {
                    const cabinets = await this.cabinetRepository.find({
                        where: { stationId: station.id, status: true }
                    });

                    const cabinetIds = cabinets.map((c) => c.id);
                    const slots = await this.slotRepository.find({
                        where: { cabinetId: In(cabinetIds) }
                    });

                    const slotAvailable = slots.filter(
                        (s) => s.status === SlotStatus.EMPTY
                    ).length;

                    const slotCharging = await Promise.all(
                        slots
                            .filter(
                                (s) =>
                                    s.status === SlotStatus.CHARGING &&
                                    s.batteryId !== null
                            )
                            .map(async (s) => {
                                if (!s.batteryId) return 0;
                                const battery =
                                    await this.batteryRepository.findOne({
                                        where: { id: s.batteryId }
                                    });
                                return battery?.status ===
                                    BatteryStatus.AVAILABLE
                                    ? 1
                                    : 0;
                            })
                    ).then((res) => res.reduce((a, b) => a + b, 0));

                    const distance = Helpers.calcDistance(
                        userLat,
                        userLng,
                        station.latitude,
                        station.longitude
                    );

                    return {
                        id: station.id,
                        name: station.name,
                        description: station.description,
                        address: station.address,
                        openTime: station.openTime,
                        closeTime: station.closeTime,
                        image: station.image,
                        latitude: station.latitude,
                        longitude: station.longitude,
                        totalCabinets: cabinets.length,
                        slotAvailable,
                        slotCharging,
                        distance: Number(distance.toFixed(2))
                    };
                })
            );

            results.sort((a, b) => a.distance - b.distance);
            return {
                success: true,
                message: 'Danh sách trạm gần nhất',
                data: results.slice(0, limit)
            };
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(
                error.message || 'Lỗi khi tìm trạm gần nhất'
            );
        }
    }

    async getStationUsageData(from: string, to: string): Promise<any> {
    try {
        const fromDate = new Date(from);
        const toDate = new Date(to);

        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            throw new BadRequestException('Ngày không hợp lệ');
        }

        // Lấy tất cả trạm
        const stations = await this.stationRepository.find({
            select: ['id', 'name']
        });

        const result: Array<{
            stationId: number;
            stationName: string;
            date: string;
            totalBookings: number;
            totalReports: number;
        }> = [];

        for (const station of stations) {
            // Đếm số booking theo ngày
            const bookings = await this.dataSource
                .createQueryBuilder()
                .select('DATE(booking.createdAt)', 'date')
                .addSelect('COUNT(booking.id)', 'totalBookings')
                .from('bookings', 'booking')
                .where('booking.stationId = :stationId', {
                    stationId: station.id
                })
                .andWhere('booking.createdAt BETWEEN :from AND :to', {
                    from: fromDate,
                    to: toDate
                })
                .groupBy('DATE(booking.createdAt)')
                .getRawMany();

            // Đếm số report theo ngày
            const reports = await this.dataSource
                .createQueryBuilder()
                .select('DATE(report.createdAt)', 'date')
                .addSelect('COUNT(report.id)', 'totalReports')
                .from('reports', 'report')
                .innerJoin(
                    'booking_details',
                    'bd',
                    'bd.id = report.bookingDetailId'
                )
                .innerJoin(
                    'bookings',
                    'booking',
                    'booking.id = bd.bookingId'
                )
                .where('booking.stationId = :stationId', {
                    stationId: station.id
                })
                .andWhere('report.createdAt BETWEEN :from AND :to', {
                    from: fromDate,
                    to: toDate
                })
                .groupBy('DATE(report.createdAt)')
                .getRawMany();

            // Merge dữ liệu booking và report theo ngày
            const dateMap = new Map<string, {
                stationId: number;
                stationName: string;
                date: string;
                totalBookings: number;
                totalReports: number;
            }>();

            bookings.forEach((b) => {
                dateMap.set(b.date, {
                    stationId: station.id,
                    stationName: station.name,
                    date: b.date,
                    totalBookings: parseInt(b.totalBookings),
                    totalReports: 0
                });
            });

            reports.forEach((r) => {
                const existingData = dateMap.get(r.date);
                if (existingData) {
                    existingData.totalReports = parseInt(r.totalReports);
                } else {
                    dateMap.set(r.date, {
                        stationId: station.id,
                        stationName: station.name,
                        date: r.date,
                        totalBookings: 0,
                        totalReports: parseInt(r.totalReports)
                    });
                }
            });

            result.push(...Array.from(dateMap.values()));
        }

        return {
            message: 'Lấy dữ liệu sử dụng trạm thành công',
            data: result,
            from,
            to
        };
    } catch (error) {
        if (error instanceof BadRequestException) {
            throw error;
        }
        throw new InternalServerErrorException(
            'Lỗi khi lấy dữ liệu sử dụng trạm'
        );
    }
}
}
