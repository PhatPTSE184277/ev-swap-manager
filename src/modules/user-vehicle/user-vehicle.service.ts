/* eslint-disable prefer-const */
import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Battery, User, UserVehicle, VehicleType } from 'src/entities';
import { DataSource, Like, Repository } from 'typeorm';
import { CreateUserVehicleDto } from './dto/create-user-vehicle.dto';
import { UpdateUserVehicleDto } from './dto/update-user-vehicle.dto';

@Injectable()
export class UserVehicleService {
    constructor(
        @InjectRepository(UserVehicle)
        private readonly userVehicleRepository: Repository<UserVehicle>,
        private readonly dataSource: DataSource
    ) {}

    // async findAll(
    //     page: number = 1,
    //     limit: number = 10,
    //     search?: string,
    //     order: 'ASC' | 'DESC' = 'ASC',
    //     status?: boolean
    // ): Promise<any> {
    //     let where: any = {};
    //     if (typeof status === 'boolean') where.status = status;
    //     if (search) where.name = Like(`%${search}%`);

    //     const [data, total] = await this.userVehicleRepository.findAndCount({
    //         where,
    //         skip: (page - 1) * limit,
    //         take: limit,
    //         order: { id: order },
    //         relations: ['batteries', 'batteries.batteryType', 'vehicleType']
    //     });

    //     const mappedData = data.map(
    //         ({
    //             createdAt,
    //             updatedAt,
    //             vehicleTypeId,
    //             batteries,
    //             vehicleType,
    //             ...rest
    //         }) => ({
    //             ...rest,
    //             batteries:
    //                 batteries?.map((b) => ({
    //                     id: b.id,
    //                     model: b.model,
    //                     currentCapacity: b.currentCapacity,
    //                     healthScore: b.healthScore,
    //                     status: b.status
    //                 })) || [],
    //             vehicleType: {
    //                 id: vehicleType.id,
    //                 model: vehicleType.model,
    //                 description: vehicleType.description
    //             }
    //         })
    //     );

    //     return {
    //         data: mappedData,
    //         total,
    //         page,
    //         limit,
    //         message: 'Lấy danh sách xe của người dùng thành công'
    //     };
    // }

    async findAllByUser(
        userId: number,
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
        let where: any = { status: true, userId };
        if (search) {
            where = [{ status: true, userId, name: Like(`%${search}%`) }];
        }
        const [data, total] = await this.userVehicleRepository.findAndCount({
            where,
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: order },
            relations: ['batteries', 'batteries.batteryType', 'vehicleType']
        });

        const mappedData = data.map(
            ({
                createdAt,
                updatedAt,
                vehicleTypeId,
                vehicleType,
                status,
                userId,
                batteries,
                ...rest
            }) => ({
                ...rest,
                batteries:
                    batteries?.map((b) => ({
                        id: b.id,
                        model: b.model,
                        currentCapacity: b.currentCapacity,
                        healthScore: b.healthScore,
                        status: b.status,
                        batteryType: {
                            id: b.batteryType.id,
                            name: b.batteryType.name
                        }
                    })) || [],
                vehicleType: {
                    id: vehicleType.id,
                    model: vehicleType.model,
                    description: vehicleType.description,
                    batteryTypeId: vehicleType.batteryTypeId
                }
            })
        );

        return {
            data: mappedData,
            total,
            page,
            limit,
            message: 'Lấy danh sách xe của user thành công'
        };
    }

    async staffCreateUserVehicle(
        dto: CreateUserVehicleDto
    ): Promise<{ message: string }> {
        try {
            const result = await this.dataSource.transaction(
                async (manager) => {
                    const user = await manager.findOne(User, {
                        where: [
                            { email: dto.userNameOrEmail },
                            { username: dto.userNameOrEmail }
                        ]
                    });
                    if (!user)
                        throw new NotFoundException('Người dùng không tồn tại');

                    const existingVehicle = await manager.findOne(UserVehicle, {
                        where: {
                            userId: user.id,
                            name: dto.name,
                            status: true
                        }
                    });

                    if (existingVehicle)
                        throw new BadRequestException('Phương tiện đã tồn tại');

                    // Kiểm tra loại xe
                    const vehicleType = await manager.findOne(VehicleType, {
                        where: { id: dto.vehicleTypeId }
                    });
                    if (!vehicleType)
                        throw new NotFoundException('Loại xe không tồn tại');

                    // Kiểm tra 2 cục pin
                    if (!dto.batteries || dto.batteries.length !== 2) {
                        throw new BadRequestException(
                            'Phải cung cấp đúng 2 cục pin'
                        );
                    }

                    const batteryIds = dto.batteries.map((b) => b.batteryId);
                    const batteries = await manager.findByIds(
                        Battery,
                        batteryIds
                    );

                    if (batteries.length !== 2) {
                        throw new NotFoundException(
                            'Một hoặc nhiều pin không tồn tại'
                        );
                    }

                    // Kiểm tra loại pin có phù hợp với loại xe không
                    for (const battery of batteries) {
                        if (
                            battery.batteryTypeId !== vehicleType.batteryTypeId
                        ) {
                            throw new BadRequestException(
                                `Pin ${battery.model} (loại pin ${battery.batteryTypeId}) không phù hợp với loại xe (yêu cầu loại pin ${vehicleType.batteryTypeId})`
                            );
                        }

                        // Kiểm tra pin đã được gán cho xe khác chưa
                        if (battery.userVehicleId !== null) {
                            throw new BadRequestException(
                                `Pin ${battery.model} đã được gán cho xe khác`
                            );
                        }

                        // Kiểm tra pin có đang trong slot không (inUse = true)
                        if (battery.inUse === true) {
                            throw new BadRequestException(
                                `Pin ${battery.model} đang được sử dụng trong slot, không thể gán cho xe`
                            );
                        }
                    }

                    // Tạo xe mới
                    const newVehicle = manager.create(UserVehicle, {
                        userId: user.id,
                        vehicleTypeId: dto.vehicleTypeId,
                        name: dto.name
                    });
                    await manager.save(UserVehicle, newVehicle);

                    // Gán 2 cục pin cho xe
                    for (const battery of batteries) {
                        battery.userVehicleId = newVehicle.id;
                        await manager.save(Battery, battery);
                    }

                    return {
                        message:
                            'Nhân viên đã tạo phương tiện và gán 2 cục pin cho user thành công'
                    };
                }
            );
            return result;
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            )
                throw error;
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi nhân viên tạo phương tiện'
            );
        }
    }

    async update(
        userId: number,
        id: number,
        updateUserVehicleDto: UpdateUserVehicleDto
    ): Promise<{ message: string }> {
        return await this.dataSource.transaction(async (manager) => {
            const vehicle = await manager.findOne(UserVehicle, {
                where: { id, userId, status: true }
            });
            if (!vehicle)
                throw new NotFoundException('Không tìm thấy phương tiện');
            Object.assign(vehicle, updateUserVehicleDto);
            await manager.save(UserVehicle, vehicle);
            return { message: 'Cập nhật phương tiện thành công' };
        });
    }

    async softDelete(userId: number, id: number): Promise<{ message: string }> {
        return await this.dataSource.transaction(async (manager) => {
            const vehicle = await manager.findOne(UserVehicle, {
                where: { id, userId, status: true }
            });
            if (!vehicle)
                throw new NotFoundException('Không tìm thấy phương tiện');
            vehicle.status = false;
            await manager.save(UserVehicle, vehicle);
            return { message: 'Xóa phương tiện thành công' };
        });
    }
}
