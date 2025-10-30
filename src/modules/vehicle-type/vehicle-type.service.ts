import {
    BadRequestException,
    Injectable,
    NotFoundException,
    InternalServerErrorException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VehicleType } from 'src/entities';
import { DataSource, Like, Repository } from 'typeorm';
import { CreateVehicleTypeDto } from './dto/create-vehicle-type.dto';
import { UpdateVehicleTypeDto } from './dto/update-vehicle-type.dto';

@Injectable()
export class VehicleTypeService {
    constructor(
        @InjectRepository(VehicleType)
        private readonly vehicleTypeRepository: Repository<VehicleType>,
        private readonly dataSource: DataSource
    ) {}

    async findAll(
        page: number = 1,
        limit: number = 10,
        search?: string,
        order: 'ASC' | 'DESC' = 'ASC',
        status: boolean | string = true
    ): Promise<{
        data: any;
        message: string;
        total: number;
        page: number;
        limit: number;
    }> {
        try {
            const statusBool =
                typeof status === 'string' ? status === 'true' : !!status;
            let where: any = { status: statusBool };
            if (search) {
                where = [{ status: statusBool, model: Like(`%${search}%`) }];
            }

            const [data, total] = await this.vehicleTypeRepository.findAndCount({
                where,
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: order },
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
                    batteryTypeName: batteryType?.name || null
                })
            );

            return {
                data: mappedData,
                total,
                page,
                limit,
                message: 'Lấy danh sách loại xe thành công'
            };
        } catch (error) {
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi lấy danh sách loại xe');
        }
    }

    async findAllPublic(
        page: number = 1,
        limit: number = 10,
        search?: string,
        order: 'ASC' | 'DESC' = 'ASC'
    ): Promise<{
        data: any;
        message: string;
        total: number;
        page: number;
        limit: number;
    }> {
        try {
            let where: any = { status: true };
            if (search) {
                where = [{ status: true, model: Like(`%${search}%`) }];
            }

            const [data, total] = await this.vehicleTypeRepository.findAndCount({
                where,
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: order },
                relations: ['batteryType']
            });

            const mappedData = data.map(
                ({
                    createdAt,
                    updatedAt,
                    batteryTypeId,
                    batteryType,
                    status,
                    ...rest
                }) => ({
                    ...rest,
                    batteryTypeName: batteryType?.name || null
                })
            );

            return {
                data: mappedData,
                total,
                page,
                limit,
                message: 'Lấy danh sách loại xe thành công'
            };
        } catch (error) {
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi lấy danh sách loại xe');
        }
    }

    async findById(id: number): Promise<{ data: any; message: string }> {
        try {
            const vehicle = await this.vehicleTypeRepository.findOne({
                where: { id },
                relations: ['batteryType']
            });
            if (!vehicle) {
                throw new NotFoundException('Loại xe không tồn tại');
            }
            const { createdAt, updatedAt, batteryTypeId, batteryType, ...rest } =
                vehicle;

            return {
                message: 'Lấy thông tin loại xe thành công',
                data: {
                    ...rest,
                    batteryType: {
                        id: batteryType?.id || null,
                        name: batteryType?.name || null
                    }
                }
            };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi lấy thông tin loại xe');
        }
    }

    async create(
        createVehicleTypeDto: CreateVehicleTypeDto
    ): Promise<{ message: string }> {
        try {
            const result = await this.dataSource.transaction(
                async (manager) => {
                    const existed = await manager.findOne(VehicleType, {
                        where: { model: createVehicleTypeDto.model }
                    });
                    if (existed) {
                        throw new BadRequestException('Model xe đã tồn tại');
                    }

                    const newVehicleType = manager.create(
                        VehicleType,
                        createVehicleTypeDto
                    );
                    await manager.save(VehicleType, newVehicleType);

                    return {
                        message: 'Tạo loại xe thành công'
                    };
                }
            );
            return result;
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi tạo loại xe');
        }
    }

    async update(
        id: number,
        updateVehicleTypeDto: UpdateVehicleTypeDto
    ): Promise<any> {
        try {
            const vehicleType = await this.vehicleTypeRepository.findOne({
                where: { id }
            });
            if (!vehicleType) {
                throw new NotFoundException('Loại xe không tồn tại');
            }
            if (
                updateVehicleTypeDto.model &&
                updateVehicleTypeDto.model !== vehicleType.model
            ) {
                const existingVehicleType =
                    await this.vehicleTypeRepository.findOne({
                        where: { model: updateVehicleTypeDto.model }
                    });
                if (existingVehicleType) {
                    throw new BadRequestException('Loại xe đã tồn tại');
                }
            }

            Object.assign(vehicleType, updateVehicleTypeDto);
            await this.vehicleTypeRepository.update(id, vehicleType);
            return {
                message: 'Cập nhật loại xe thành công'
            };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi cập nhật loại xe');
        }
    }

    async softDelete(id: number): Promise<{ message: string }> {
        try {
            const vehicleType = await this.vehicleTypeRepository.findOne({
                where: { id }
            });
            if (!vehicleType) {
                throw new NotFoundException('Loại xe không tồn tại');
            }
            if (vehicleType.status === false) {
                throw new BadRequestException('Loại xe đã được xóa trước đó');
            }
            vehicleType.status = false;
            await this.vehicleTypeRepository.save(vehicleType);
            return {
                message: 'Xóa loại xe thành công'
            };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi xóa loại xe');
        }
    }

    async restore(id: number): Promise<{ message: string }> {
        try {
            const vehicleType = await this.vehicleTypeRepository.findOne({
                where: { id }
            });
            if (!vehicleType) {
                throw new NotFoundException('Loại xe không tồn tại');
            }
            if (vehicleType.status === true) {
                throw new BadRequestException('Loại xe đã được khôi phục trước đó');
            }
            vehicleType.status = true;
            await this.vehicleTypeRepository.save(vehicleType);
            return {
                message: 'Khôi phục loại xe thành công'
            };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi khôi phục loại xe');
        }
    }
}