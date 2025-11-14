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
import { BatteryStatus } from 'src/enums';

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
                        where: { id: dto.vehicleTypeId },
                        relations: ['batteryType']
                    });
                    if (!vehicleType)
                        throw new NotFoundException('Loại xe không tồn tại');

                    // Tạo xe mới
                    const newVehicle = manager.create(UserVehicle, {
                        userId: user.id,
                        vehicleTypeId: dto.vehicleTypeId,
                        name: dto.name
                    });
                    await manager.save(UserVehicle, newVehicle);

                    // Tạo 2 cục pin mới tự động
                    const batteryType = vehicleType.batteryType;
                    const batteryPrefix = batteryType.name.includes('48V')
                        ? 'BAT48V'
                        : batteryType.name.includes('60V')
                          ? 'BAT60V'
                          : 'BAT';

                    // Lấy số thứ tự pin cuối cùng của loại pin này
                    const lastBattery = await manager
                        .createQueryBuilder(Battery, 'battery')
                        .where('battery.batteryTypeId = :batteryTypeId', {
                            batteryTypeId: batteryType.id
                        })
                        .orderBy('battery.id', 'DESC')
                        .getOne();

                    let nextNumber = 1;
                    if (lastBattery && lastBattery.model) {
                        const match = lastBattery.model.match(/\d+$/);
                        if (match) {
                            nextNumber = parseInt(match[0]) + 1;
                        }
                    }

                    // Tạo 2 cục pin
                    for (let i = 0; i < 2; i++) {
                        const batteryModel = `${batteryPrefix}${String(nextNumber + i).padStart(3, '0')}`;

                        const newBattery = new Battery();
                        newBattery.batteryTypeId = batteryType.id;
                        newBattery.model = batteryModel;
                        newBattery.currentCycle = 0;
                        newBattery.userVehicleId = newVehicle.id;
                        newBattery.currentCapacity = 100;
                        newBattery.healthScore = 100;
                        newBattery.lastChargeTime = null;
                        newBattery.estimatedFullChargeTime = null;
                        newBattery.inUse = true;
                        newBattery.status = BatteryStatus.IN_USE;

                        await manager.save(Battery, newBattery);
                    }

                    return {
                        message:
                            'Nhân viên đã tạo phương tiện và tự động tạo 2 cục pin mới cho user thành công'
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
