/* eslint-disable prefer-const */
import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Station } from 'src/entities';
import { DataSource, Like, Repository } from 'typeorm';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateBatteryDto } from '../battery/dto/update-battery.dto';
import { UpdateStationDto } from './dto/update-station.dto';

@Injectable()
export class StationService {
    constructor(
        @InjectRepository(Station)
        private readonly stationRepository: Repository<Station>,
        private readonly dataSource: DataSource
    ) {}

    async findAll(
        page: number = 1,
        limit: number = 10,
        search?: string,
        order: 'ASC' | 'DESC' = 'ASC',
        status?: boolean
    ): Promise<any> {
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
    }

    async findById(id: number): Promise<{ data: Station; message: string }> {
        const station = await this.stationRepository.findOne({ where: { id } });
        if (!station) {
            throw new NotFoundException('Trạm không tồn tại');
        }

        const { createdAt, updatedAt, ...rest } = station;
        return {
            data: rest as Station,
            message: 'Lấy thông tin trạm thành công'
        };
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
            throw new BadRequestException(
                error?.message || 'Tạo trạm thất bại'
            );
        }
    }

    async update(id: number, updateStationDto: UpdateStationDto): Promise<any> {
        const station = await this.stationRepository.findOne({ where: { id } });
        if (!station) {
            throw new BadRequestException('Trạm không tồn tại');
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
    }

    async softDelete(id: number): Promise<any> {
        const station = await this.stationRepository.findOne({ where: { id } });
        if (!station) {
            throw new BadRequestException('Trạm không tồn tại');
        }

        station.status = false;
        await this.stationRepository.save(station);
        return {
            message: 'Xóa trạm thành công'
        };
    }

    async restore(id: number): Promise<any> {
        const station = await this.stationRepository.findOne({ where: { id } });
        if (!station) {
            throw new BadRequestException('Trạm không tồn tại');
        }
        station.status = true;
        await this.stationRepository.save(station);
        return {
            message: 'Khôi phục trạm thành công'
        };
    }
}