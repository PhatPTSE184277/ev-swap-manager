/* eslint-disable prefer-const */
import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Battery, BatteryType, UserVehicle } from 'src/entities';
import { DataSource, Like, Repository } from 'typeorm';
import { UpdateBatteryDto } from './dto/update-battery.dto';
import { CreateBatteryDto } from './dto/create-battery.dto';
import { BatteryStatus, BookingStatus } from 'src/enums';
import { CreateUserBatteryDto } from './dto/create-user-battery.dto';

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
        try {
            let where: any = {};
            if (status) where.status = status;
            if (search) where.model = Like(`%${search}%`);

            const [data, total] = await this.batteryRepository.findAndCount({
                where,
                skip: (page - 1) * limit,
                take: limit,
                order: { model: order },
                relations: ['batteryType', 'slots']
            });

            const mappedData = data.map(
                ({
                    createdAt,
                    updatedAt,
                    batteryTypeId,
                    batteryType,
                    slots,
                    ...rest
                }) => ({
                    ...rest,
                    batteryType: batteryType?.name || null,
                    slotId: slots && slots.length > 0 ? slots[0].id : null
                })
            );

            return {
                data: mappedData,
                total,
                page,
                limit
            };
        } catch (error) {
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi lấy danh sách pin'
            );
        }
    }

    async findById(id: number): Promise<any> {
        try {
            const battery = await this.batteryRepository.findOne({
                where: { id },
                relations: ['batteryType', 'slots']
            });
            if (!battery) {
                throw new NotFoundException('Pin không tồn tại');
            }
            const { createdAt, updatedAt, batteryTypeId, slots, ...rest } =
                battery;

            const slot = slots && slots.length > 0 ? slots[0] : null;

            if (battery.batteryType) {
                const { createdAt, updatedAt, ...batteryTypeRest } =
                    battery.batteryType;
                return {
                    data: {
                        ...rest,
                        batteryType: batteryTypeRest,
                        slot: slot
                            ? {
                                  id: slot.id,
                                  name: slot.name,
                                  cabinetId: slot.cabinetId,
                                  status: slot.status
                              }
                            : null
                    },
                    message: 'Lấy thông tin pin thành công'
                };
            }
            return {
                data: {
                    ...rest,
                    slot: slot
                        ? {
                              id: slot.id,
                              name: slot.name,
                              cabinetId: slot.cabinetId,
                              status: slot.status
                          }
                        : null
                },
                message: 'Lấy thông tin pin thành công'
            };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi lấy thông tin pin'
            );
        }
    }

    async getBatteryByType(
        batteryTypeId: number,
        page: number = 1,
        limit: number = 10,
        search?: string,
        status?: string
    ): Promise<any> {
        try {
            const where: any = { batteryTypeId };
            if (status) where.status = status;
            if (search) where.model = Like(`%${search}%`);

            const [data, total] = await this.batteryRepository.findAndCount({
                where,
                skip: (page - 1) * limit,
                take: limit,
                order: { model: 'ASC' },
                relations: ['batteryType', 'slots']
            });

            const mappedData = data.map(
                ({
                    createdAt,
                    updatedAt,
                    batteryTypeId,
                    batteryType,
                    slots,
                    ...rest
                }) => ({
                    ...rest,
                    batteryType: {
                        id: batteryType.id,
                        name: batteryType.name
                    },
                    slotId: slots && slots.length > 0 ? slots[0].id : null
                })
            );

            return {
                data: mappedData,
                total,
                page,
                limit
            };
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }

            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi lấy pin theo loại'
            );
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

                    const batteryType = await manager.findOne(BatteryType, {
                        where: { id: createBatteryDto.batteryTypeId }
                    });

                    if (!batteryType) {
                        throw new BadRequestException('Loại pin không tồn tại');
                    }

                    const newBattery = manager.create(Battery, {
                        ...createBatteryDto,
                        currentCycle: 0,
                        currentCapacity: 100,
                        healthScore: 100,
                        status:
                            createBatteryDto.status ?? BatteryStatus.AVAILABLE
                    });
                    await manager.save(Battery, newBattery);
                    const { createdAt, updatedAt, batteryTypeId, ...rest } =
                        newBattery;
                    return {
                        message: 'Tạo pin thành công'
                    };
                }
            );
            return result;
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi tạo pin'
            );
        }
    }

    async update(id: number, updateBatteryDto: UpdateBatteryDto): Promise<any> {
        try {
            const battery = await this.batteryRepository.findOne({
                where: { id }
            });
            if (!battery) {
                throw new NotFoundException('Pin không tồn tại');
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
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            )
                throw error;
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi cập nhật pin'
            );
        }
    }

    async staffCreateBatteryForUserVehicle(
        dto: CreateUserBatteryDto
    ): Promise<any> {
        try {
            const result = await this.dataSource.transaction(
                async (manager) => {
                    const userVehicle = await manager.findOne(UserVehicle, {
                        where: { id: dto.userVehicleId, status: true },
                        relations: ['vehicleType']
                    });

                    if (!userVehicle) {
                        throw new NotFoundException(
                            'Phương tiện người dùng không tồn tại hoặc không hoạt động'
                        );
                    }

                    const batteryTypeId =
                        userVehicle.vehicleType?.batteryTypeId;
                    if (!batteryTypeId) {
                        throw new BadRequestException(
                            'Loại pin cho phương tiện này không xác định'
                        );
                    }

                    const existingBattery = await manager.findOne(Battery, {
                        where: { model: dto.model }
                    });
                    if (existingBattery) {
                        throw new BadRequestException('Pin đã tồn tại');
                    }

                    const newBattery = manager.create(Battery, {
                        batteryTypeId: batteryTypeId,
                        model: dto.model,
                        currentCapacity: dto.currentCapacity ?? 100,
                        currentCycle: dto.currentCycle ?? 0,
                        healthScore: dto.healthScore ?? 100,
                        status: BatteryStatus.IN_USE,
                        userVehicleId: dto.userVehicleId
                    });
                    await manager.save(Battery, newBattery);

                    return {
                        message: 'Tạo pin cho phương tiện người dùng thành công'
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
                error?.message ||
                    'Lỗi hệ thống khi tạo pin cho phương tiện người dùng'
            );
        }
    }
}
