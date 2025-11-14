import {
    Injectable,
    NotFoundException,
    BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Battery, Slot, SlotHistory } from 'src/entities';
import { BatteryStatus, SlotStatus } from 'src/enums';
import { TakeBatteryDto } from './dto/take-battery.dto';
import { PutBatteryDto } from './dto/put-battery.dto';

import { Request } from 'src/entities/request.entity';
import { RequestStatus } from 'src/enums';

@Injectable()
export class TransferBatteryService {
    constructor(
        @InjectRepository(Slot)
        private readonly slotRepository: Repository<Slot>,
        @InjectRepository(Battery)
        private readonly batteryRepository: Repository<Battery>,
        @InjectRepository(Request)
        private readonly requestRepository: Repository<Request>,
        private readonly dataSource: DataSource
    ) {}

    async takeBatteryFromSlot(takeBatteryDto: TakeBatteryDto): Promise<any> {
        try {
            const result = await this.dataSource.transaction(
                async (manager) => {
                    const slot = await manager.findOne(Slot, {
                        where: { id: takeBatteryDto.slotId },
                        relations: ['battery', 'battery.batteryType', 'cabinet']
                    });

                    if (!slot) {
                        throw new NotFoundException('Slot không tồn tại');
                    }

                    if (!slot.batteryId) {
                        throw new BadRequestException('Slot không có pin');
                    }

                    const battery = slot.battery;

                    if (!battery) {
                        throw new NotFoundException('Pin không tồn tại');
                    }

                    if (battery.status !== BatteryStatus.DAMAGED) {
                        if (battery.inUse !== false) {
                            throw new BadRequestException(
                                'Chỉ được lấy pin không đang sử dụng (inUse = false)'
                            );
                        }
                    }

                    // Kiểm tra request của pin này
                    const request = await manager.findOne(Request, {
                        where: {
                            batteryId: battery.id,
                            status: RequestStatus.PENDING
                        }
                    });

                    if (request) {
                        // Cập nhật request sang TRANSFERRING
                        await manager.update(Request, request.id, {
                            status: RequestStatus.TRANSFERRING
                        });
                    }

                    // Lưu slot history
                    const slotHistory = manager.create(SlotHistory, {
                        slotId: slot.id,
                        batteryId: battery.id,
                        status: false
                    });
                    await manager.save(SlotHistory, slotHistory);

                    // Cập nhật slot về EMPTY
                    await manager.update(Slot, slot.id, {
                        batteryId: null as any,
                        status: SlotStatus.EMPTY
                    });

                    await manager.update(Battery, battery.id, { inUse: false });
                    return {
                        message:
                            'Lấy pin ra khỏi slot để chuyển trạm thành công'
                    };
                }
            );

            return result;
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }
            throw new BadRequestException(
                error?.message ||
                    'Lỗi hệ thống khi lấy pin từ slot để chuyển trạm'
            );
        }
    }

    async putBatteryToSlot(putBatteryDto: PutBatteryDto): Promise<any> {
        try {
            const result = await this.dataSource.transaction(
                async (manager) => {
                    const slot = await manager.findOne(Slot, {
                        where: { id: putBatteryDto.slotId },
                        relations: ['cabinet', 'cabinet.station']
                    });

                    if (!slot) {
                        throw new NotFoundException('Slot không tồn tại');
                    }

                    if (slot.status !== SlotStatus.EMPTY) {
                        throw new BadRequestException(
                            `Slot đang ở trạng thái ${slot.status}, không thể đặt pin vào`
                        );
                    }

                    if (slot.batteryId) {
                        throw new BadRequestException(
                            'Slot đã có pin, không thể bỏ thêm'
                        );
                    }

                    const battery = await manager.findOne(Battery, {
                        where: { id: putBatteryDto.batteryId },
                        relations: ['batteryType']
                    });

                    if (!battery) {
                        throw new NotFoundException('Pin không tồn tại');
                    }

                    // Chỉ được bỏ pin AVAILABLE hoặc CHARGING
                    if (
                        battery.status !== BatteryStatus.AVAILABLE &&
                        battery.status !== BatteryStatus.CHARGING &&
                        battery.status !== BatteryStatus.DAMAGED
                    ) {
                        throw new BadRequestException(
                            'Chỉ được bỏ vào slot những pin ở trạng thái AVAILABLE, CHARGING hoặc DAMAGED'
                        );
                    }

                    // Kiểm tra loại pin phù hợp với cabinet
                    if (
                        slot.cabinet &&
                        slot.cabinet.batteryTypeId !== battery.batteryTypeId
                    ) {
                        throw new BadRequestException(
                            'Loại pin không phù hợp với tủ này'
                        );
                    }

                    // Kiểm tra request của pin này
                    const request = await manager.findOne(Request, {
                        where: {
                            batteryId: battery.id,
                            status: RequestStatus.TRANSFERRING
                        }
                    });

                    if (request) {
                        // Kiểm tra slot có thuộc trạm đích của request không
                        const stationId = slot.cabinet?.stationId;
                        if (stationId !== request.newStationId) {
                            throw new BadRequestException(
                                `Pin này cần được bỏ vào trạm ${request.newStationId}, không phải trạm ${stationId}`
                            );
                        }

                        // Cập nhật request sang COMPLETED
                        await manager.update(Request, request.id, {
                            status: RequestStatus.COMPLETED
                        });
                    }

                    // Lưu slot history
                    const slotHistory = manager.create(SlotHistory, {
                        slotId: slot.id,
                        batteryId: battery.id,
                        status: true
                    });
                    await manager.save(SlotHistory, slotHistory);

                    // Cập nhật slot với pin và trạng thái theo pin
                    slot.batteryId = battery.id;
                    slot.status =
                        battery.status === BatteryStatus.CHARGING
                            ? SlotStatus.CHARGING
                            : battery.status === BatteryStatus.DAMAGED
                              ? SlotStatus.DAMAGED_BATTERY
                              : SlotStatus.AVAILABLE;
                    await manager.save(Slot, slot);

                    // Cập nhật inUse thành true
                    await manager.update(Battery, battery.id, { inUse: true });

                    return {
                        message: 'Bỏ pin vào slot thành công'
                    };
                }
            );

            return result;
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }
            throw new BadRequestException(
                error?.message || 'Lỗi hệ thống khi bỏ pin vào slot'
            );
        }
    }
}