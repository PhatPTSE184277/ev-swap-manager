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

@Injectable()
export class TransferBatteryService {
    constructor(
        @InjectRepository(Slot)
        private readonly slotRepository: Repository<Slot>,
        @InjectRepository(Battery)
        private readonly batteryRepository: Repository<Battery>,
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

                    if (
                        battery.status !== BatteryStatus.DAMAGED
                    ) {
                        if (battery.inUse !== false) {
                            throw new BadRequestException(
                                'Chỉ được lấy pin không đang sử dụng (inUse = false)'
                            );
                        }
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
                            'Lấy pin ra khỏi slot để chuyển trạm thành công',
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
                        relations: ['cabinet']
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
                        battery.status !== BatteryStatus.CHARGING
                    ) {
                        throw new BadRequestException(
                            'Chỉ được bỏ vào slot những pin ở trạng thái AVAILABLE hoặc CHARGING'
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
