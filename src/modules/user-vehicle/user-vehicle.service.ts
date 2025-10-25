/* eslint-disable prefer-const */
import {
    ConflictException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserVehicle } from 'src/entities';
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

    async create(
        userId: number,
        createUserVehicleDto: CreateUserVehicleDto
    ): Promise<{ message: string }> {
        return await this.dataSource.transaction(async (manager) => {
            const existed = await manager.findOne(UserVehicle, {
                where: {
                    userId,
                    vehicleTypeId: createUserVehicleDto.vehicleTypeId,
                    name: createUserVehicleDto.name,
                    status: true
                }
            });
            if (existed) {
                throw new ConflictException(
                    'Bạn đã đăng ký phương tiện này rồi'
                );
            }

            const newUserVehicle = manager.create(UserVehicle, {
                userId,
                ...createUserVehicleDto,
                status: true
            });
            await manager.save(UserVehicle, newUserVehicle);

            return { message: 'Tạo phương tiện thành công' };
        });
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
