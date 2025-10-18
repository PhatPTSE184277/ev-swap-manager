import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
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
        status?: boolean | string
    ): Promise<any> {
        try {
            let where: any = {};
            if (typeof status !== 'undefined') {
                const statusBool =
                    typeof status === 'string' ? status === 'true' : !!status;
                where.status = statusBool;
            }
            if (search) {
                if (where.status !== undefined) {
                    where = [
                        { status: where.status, name: Like(`%${search}%`) }
                    ];
                } else {
                    where = [{ name: Like(`%${search}%`) }];
                }
            }

            const [data, total] = await this.batteryTypeRepository.findAndCount(
                {
                    where,
                    skip: (page - 1) * limit,
                    take: limit,
                    order: { name: order }
                }
            );
            const mappedData = data.map(
                ({ createdAt, updatedAt, ...rest }) => rest
            );
            return {
                data: {
                    data: mappedData,
                    total,
                    page,
                    limit
                }
            };
        } catch (error) {
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi lấy danh sách loại pin'
            );
        }
    }

    async findAllPublic(
        page: number = 1,
        limit: number = 10,
        search?: string,
        order: 'ASC' | 'DESC' = 'ASC',
        status: boolean | string = true
    ): Promise<any> {
        try {
            const statusBool =
                typeof status === 'string' ? status === 'true' : !!status;
            let where: any = { status: statusBool };
            if (search) {
                where = [{ status: statusBool, name: Like(`%${search}%`) }];
            }

            const [data, total] = await this.batteryTypeRepository.findAndCount(
                {
                    where,
                    skip: (page - 1) * limit,
                    take: limit,
                    order: { name: order }
                }
            );

            const mappedData = data.map(({ id, name }) => ({ id, name }));

            return {
                data: mappedData,
                total,
                page,
                limit,
                message: 'Lấy danh sách loại pin thành công'
            };
        } catch (error) {
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi lấy danh sách loại pin'
            );
        }
    }

    async findById(id: number): Promise<any> {
        try {
            const batteryType = await this.batteryTypeRepository.findOne({
                where: { id }
            });
            if (!batteryType) {
                throw new NotFoundException('Loại pin không tồn tại');
            }
            const { createdAt, updatedAt, status, ...rest } = batteryType;
            return {
                data: rest,
                message: 'Lấy thông tin loại pin thành công'
            };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi lấy thông tin loại pin'
            );
        }
    }

    async findByName(name: string): Promise<any> {
        try {
            const batteryType = await this.batteryTypeRepository.findOne({
                where: { name }
            });
            if (!batteryType) {
                throw new NotFoundException('Loại pin không tồn tại');
            }
            const { createdAt, updatedAt, status, ...rest } = batteryType;
            return rest;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi lấy thông tin loại pin'
            );
        }
    }

    async create(createBatteryTypeDto: CreateBatteryTypeDto): Promise<any> {
        try {
            const result = await this.dataSource.transaction(
                async (manager) => {
                    const existingBatteryType = await manager.findOne(
                        BatteryType,
                        {
                            where: { name: createBatteryTypeDto.name }
                        }
                    );
                    if (existingBatteryType) {
                        throw new BadRequestException('Loại pin đã tồn tại');
                    }

                    const batteryType = manager.create(
                        BatteryType,
                        createBatteryTypeDto
                    );
                    const saved = await manager.save(batteryType);
                    const { createdAt, updatedAt, status, ...rest } = saved;
                    return {
                        data: rest,
                        message: 'Tạo loại pin thành công'
                    };
                }
            );
            return result;
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi tạo loại pin'
            );
        }
    }

    async update(
        id: number,
        updateBatteryTypeDto: UpdateBatteryTypeDto
    ): Promise<any> {
        try {
            const batteryType = await this.batteryTypeRepository.findOne({
                where: { id }
            });
            if (!batteryType) {
                throw new NotFoundException('Loại pin không tồn tại');
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
                message: 'Cập nhật loại pin thành công'
            };
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            )
                throw error;
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi cập nhật loại pin'
            );
        }
    }

    async softDelete(id: number): Promise<any> {
        try {
            const batteryType = await this.batteryTypeRepository.findOne({
                where: { id }
            });
            if (!batteryType) {
                throw new NotFoundException('Loại pin không tồn tại');
            }
            if (batteryType.status === false) {
                throw new BadRequestException('Loại pin đã bị xoá trước đó');
            }
            batteryType.status = false;
            await this.batteryTypeRepository.save(batteryType);
            return {
                message: 'Xoá loại pin thành công'
            };
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            )
                throw error;
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi xoá loại pin'
            );
        }
    }

    async restore(id: number): Promise<any> {
        try {
            const batteryType = await this.batteryTypeRepository.findOne({
                where: { id }
            });
            if (!batteryType) {
                throw new NotFoundException('Loại pin không tồn tại');
            }
            if (batteryType.status === true) {
                throw new BadRequestException(
                    'Loại pin đã được kích hoạt trước đó'
                );
            }
            batteryType.status = true;
            await this.batteryTypeRepository.save(batteryType);
            return {
                message: 'Khôi phục loại pin thành công'
            };
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            )
                throw error;
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi khôi phục loại pin'
            );
        }
    }
}
