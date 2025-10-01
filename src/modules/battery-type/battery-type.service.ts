import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BatteryType } from 'src/entities/battery-type.entity';
import { DataSource, Like, Repository } from 'typeorm';
import { CreateBatteryTypeDto } from './dto/create-battery-type.dto';
import { UpdateBatteryTypeDto } from './dto/update-battery-type.dto';

@Injectable()
export class BatteryTypeService {
    constructor(
        @InjectRepository(BatteryType)
        private readonly batteryTypeRepository: Repository<BatteryType>,
        private readonly dataSource: DataSource
    ) {}

    async findAll(
        page: number = 1,
        limit: number = 10,
        search?: string,
        order: 'ASC' | 'DESC' = 'ASC',
        status: boolean | string = true
    ): Promise<any> {
        const statusBool =
            typeof status === 'string' ? status === 'true' : !!status;
        let where: any = { status: statusBool };
        if (search) {
            where = [
                { status: statusBool, name: Like(`%${search}%`) }
            ];
        }

        const [data, total] = await this.batteryTypeRepository.findAndCount({
            where,
            skip: (page - 1) * limit,
            take: limit,
            order: { name: order }
        });
        const mappedData = data.map(
            ({ createdAt, updatedAt, status, ...rest }) => rest
        );
        return {
            data: {
                data: mappedData,
                total,
                page,
                limit
            }
        };
    }

    async findById(id: number): Promise<any> {
        const batteryType = await this.batteryTypeRepository.findOne({
            where: { id }
        });
        if (!batteryType) {
            throw new BadRequestException('Loại pin không tồn tại');
        }
        const { createdAt, updatedAt, status, ...rest } = batteryType;
        return {
            data: rest,
            message: 'Lấy thông tin loại pin thành công'
        };
    }

    async findByName(name: string): Promise<any> {
        const batteryType = await this.batteryTypeRepository.findOne({
            where: { name }
        });
        if (!batteryType) {
            throw new BadRequestException('Loại pin không tồn tại');
        }
        const { createdAt, updatedAt, status, ...rest } = batteryType;
        return rest;
    }

    async create(createBatteryTypeDto: CreateBatteryTypeDto): Promise<any> {
        try {
            const result = await this.dataSource.transaction(async (manager) => {
                const existingBatteryType = await manager.findOne(BatteryType, {
                    where: { name: createBatteryTypeDto.name }
                });
                if (existingBatteryType) {
                    throw new BadRequestException('Loại pin đã tồn tại');
                }

                const batteryType = manager.create(BatteryType, createBatteryTypeDto);
                const saved = await manager.save(batteryType);
                const { createdAt, updatedAt, status, ...rest } = saved;
                return {
                    data: rest,
                    message: 'Tạo loại pin thành công'
                };
            });
            return result;
        } catch (error) {
            throw new BadRequestException(error?.message || 'Tạo loại pin thất bại');
        }
    }
    async update(
        id: number,
        updateBatteryTypeDto: UpdateBatteryTypeDto
    ): Promise<any> {
        const batteryType = await this.batteryTypeRepository.findOne({
            where: { id }
        });
        if (!batteryType) {
            throw new BadRequestException('Loại pin không tồn tại');
        }
        if (
            updateBatteryTypeDto.name &&
            updateBatteryTypeDto.name !== batteryType.name
        ) {
            const existingBatteryType =
                await this.batteryTypeRepository.findOne({
                    where: { name: updateBatteryTypeDto.name }
                });
            if (existingBatteryType) {
                throw new BadRequestException('Loại pin đã tồn tại');
            }
        }
        Object.assign(batteryType, updateBatteryTypeDto);
        await this.batteryTypeRepository.save(batteryType);
        const { createdAt, updatedAt, status, ...rest } = batteryType;
        return {
            message: 'Cập nhật loại pin thành công',
        };
    }

    async remove(id: number): Promise<any> {
        const batteryType = await this.batteryTypeRepository.findOne({
            where: { id }
        });
        if (!batteryType) {
            throw new BadRequestException('Loại pin không tồn tại');
        }
        batteryType.status = false;
        await this.batteryTypeRepository.save(batteryType);
        return {
            message: 'Xoá loại pin thành công'
        };
    }
}
