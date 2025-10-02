/* eslint-disable prefer-const */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Battery } from 'src/entities';
import { DataSource, Like, Repository } from 'typeorm';
import { UpdateBatteryDto } from './dto/update-battery.dto';
import { CreateBatteryDto } from './dto/create-battery.dto';

@Injectable()
export class BatteryService {
    constructor(
        @InjectRepository(Battery)
        private readonly batteryRepository: Repository<Battery>,
        private readonly dataSource: DataSource
    ) {}

    async findAll(
        page: number = 1,
        limit: number = 10,
        search?: string,
        order: 'ASC' | 'DESC' = 'ASC',
        status?: string
    ): Promise<any> {
        let where: any = {};
        if (status) where.status = status;
        if (search) where.name = Like(`%${search}%`);
        
        const [data, total] = await this.batteryRepository.findAndCount({
            where,
            skip: (page - 1) * limit,
            take: limit,
            order: { model: order },
            relations: ['batteryType']
        });

        const mappedData = data.map(
            ({
                createdAt,
                updatedAt,
                batteryTypeId,
                batteryType,
                ...rest
            }) => ({
                ...rest,
                batteryType: batteryType?.name || null
            })
        );

        return {
            data: mappedData,
            total,
            page,
            limit
        };
    }

    async findById(id: number): Promise<any> {
        const battery = await this.batteryRepository.findOne({
            where: { id },
            relations: ['batteryType']
        });
        if (!battery) {
            throw new BadRequestException('Pin không tồn tại');
        }
        const { createdAt, updatedAt, batteryTypeId, ...rest } = battery;
        if (battery.batteryType) {
            const { createdAt, updatedAt, ...batteryTypeRest } =
                battery.batteryType;
            return {
                data: { ...rest, batteryType: batteryTypeRest },
                message: 'Lấy thông tin pin thành công'
            };
        }
    }

    async create(createBatteryDto: CreateBatteryDto): Promise<any> {
        try {
            const result = await this.dataSource.transaction(
                async (manager) => {
                    const existingBattery = await manager.findOne(Battery, {
                        where: { model: createBatteryDto.model }
                    });
                    if (existingBattery) {
                        throw new BadRequestException('Pin đã tồn tại');
                    }

                    const newBattery = manager.create(
                        Battery,
                        createBatteryDto
                    );
                    await manager.save(Battery, newBattery);
                    const { createdAt, updatedAt, batteryTypeId, ...rest } =
                        newBattery;
                    return {
                        data: rest,
                        message: 'Tạo pin thành công'
                    };
                }
            );
            return result;
        } catch (error) {
            throw new BadRequestException(error?.message || 'Tạo pin thất bại');
        }
    }

    async update(id: number, updateBatteryDto: UpdateBatteryDto): Promise<any> {
        const battery = await this.batteryRepository.findOne({ where: { id } });
        if (!battery) {
            throw new BadRequestException('Pin không tồn tại');
        }
        if (
            updateBatteryDto.model &&
            updateBatteryDto.model !== battery.model
        ) {
            const existingBattery = await this.batteryRepository.findOne({
                where: { model: updateBatteryDto.model }
            });
            if (existingBattery) {
                throw new BadRequestException('Pin đã tồn tại');
            }
        }

        Object.assign(battery, updateBatteryDto);
        await this.batteryRepository.update(id, battery);
        return {
            message: 'Cập nhật pin thành công'
        };
    }
}
