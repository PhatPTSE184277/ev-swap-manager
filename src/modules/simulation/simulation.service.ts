import {
    Injectable,
    NotFoundException,
    BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    Slot,
    Battery,
    SlotHistory,
    Booking,
    BatteryUsedHistory
} from 'src/entities';
import { Repository, DataSource } from 'typeorm';
import {
    SlotStatus,
    BatteryStatus,
    BookingStatus,
    BookingDetailStatus
} from 'src/enums';
import { TakeBatteryDto } from './dto/take-battery.dto';
import { PutBatteryDto } from './dto/put-battery.dto';

@Injectable()
export class SimulationService {
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
                    const booking = await manager.findOne(Booking, {
                        where: { id: takeBatteryDto.bookingId },
                        relations: [
                            'bookingDetails',
                            'bookingDetails.battery',
                            'userVehicle',
                            'userVehicle.vehicleType'
                        ]
                    });

                    if (!booking) {
                        throw new NotFoundException('Không tìm thấy booking');
                    }

                    if (booking.status !== BookingStatus.IN_PROGRESS) {
                        throw new BadRequestException(
                            `Booking đang ở trạng thái ${booking.status}, không thể lấy pin`
                        );
                    }

                    const slot = await manager.findOne(Slot, {
                        where: { id: takeBatteryDto.slotId },
                        relations: ['battery', 'battery.batteryType', 'cabinet']
                    });

                    if (!slot) {
                        throw new NotFoundException('Không tìm thấy slot');
                    }

                    if (slot.status !== SlotStatus.RESERVED) {
                        throw new BadRequestException(
                            `Slot đang ở trạng thái ${slot.status}, không thể lấy pin`
                        );
                    }

                    if (!slot.batteryId) {
                        throw new BadRequestException(
                            'Slot không có pin để lấy'
                        );
                    }

                    const battery = slot.battery;

                    if (!battery) {
                        throw new NotFoundException(
                            'Pin không tồn tại trong slot'
                        );
                    }

                    const bookingDetail = booking.bookingDetails.find(
                        (detail) => detail.batteryId === battery.id
                    );

                    if (!bookingDetail) {
                        throw new BadRequestException(
                            'Pin này không nằm trong booking của bạn'
                        );
                    }

                    if (
                        booking.userVehicle.vehicleType.batteryTypeId !==
                        battery.batteryTypeId
                    ) {
                        throw new BadRequestException(
                            'Loại pin không phù hợp với loại xe của bạn'
                        );
                    }

                    const slotHistory = manager.create(SlotHistory, {
                        slotId: slot.id,
                        batteryId: battery.id,
                        status: false
                    });
                    await manager.save(SlotHistory, slotHistory);

                    await manager.update(Slot, slot.id, {
                        batteryId: null as any,
                        status: SlotStatus.EMPTY
                    });

                    battery.userVehicleId = booking.userVehicle.id;
                    battery.status = BatteryStatus.IN_USE;
                    battery.currentCycle += 1;
                    battery.healthScore = battery.calcHealthScore();
                    await manager.save(Battery, battery);

                    const batteryUsedHistory = manager.create(
                        BatteryUsedHistory,
                        {
                            batteryId: battery.id,
                            bookingId: booking.id,
                            currentCycle: battery.currentCycle,
                            currentCapacity: battery.currentCapacity,
                            healthScore: battery.healthScore,
                            percent: battery.currentCapacity,
                            recentPrice: bookingDetail.price,
                            status: true
                        }
                    );
                    await manager.save(BatteryUsedHistory, batteryUsedHistory);

                    bookingDetail.status = BookingDetailStatus.COMPLETED;
                    await manager.save('BookingDetail', bookingDetail);

                    const allCompleted = booking.bookingDetails.every(
                        (detail) =>
                            detail.status === BookingDetailStatus.COMPLETED
                    );

                    if (allCompleted) {
                        booking.status = BookingStatus.COMPLETED;
                    } else {
                        booking.status = BookingStatus.IN_PROGRESS;
                    }
                    await manager.save(Booking, booking);

                    return {
                        message: 'Lấy pin ra khỏi slot và gắn vào xe thành công'
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
                error?.message || 'Lỗi hệ thống khi lấy pin từ slot'
            );
        }
    }

    async putBatteryToSlot(putBatteryDto: PutBatteryDto): Promise<any> {
        try {
            const result = await this.dataSource.transaction(
                async (manager) => {
                    const booking = await manager.findOne(Booking, {
                        where: { id: putBatteryDto.bookingId },
                        relations: ['userVehicle', 'userVehicle.batteries']
                    });

                    if (!booking) {
                        throw new NotFoundException('Không tìm thấy booking');
                    }

                    if (booking.status !== BookingStatus.IN_PROGRESS) {
                        throw new BadRequestException(
                            `Booking đang ở trạng thái ${booking.status}, không thể bỏ pin vào slot`
                        );
                    }

                    const slot = await manager.findOne(Slot, {
                        where: { id: putBatteryDto.slotId },
                        relations: ['cabinet']
                    });

                    if (!slot) {
                        throw new NotFoundException('Không tìm thấy slot');
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
                        throw new NotFoundException('Không tìm thấy pin');
                    }

                    if (battery.userVehicleId !== booking.userVehicle.id) {
                        throw new BadRequestException(
                            'Pin này không phải là pin của xe trong booking'
                        );
                    }

                    if (battery.status !== BatteryStatus.IN_USE) {
                        throw new BadRequestException(
                            `Pin đang ở trạng thái ${battery.status}, không thể bỏ vào slot`
                        );
                    }

                    if (
                        slot.cabinet &&
                        slot.cabinet.batteryTypeId !== battery.batteryTypeId
                    ) {
                        throw new BadRequestException(
                            'Loại pin không phù hợp với tủ này'
                        );
                    }

                    battery.userVehicleId = null;

                    const slotHistory = manager.create(SlotHistory, {
                        slotId: slot.id,
                        batteryId: battery.id,
                        status: true
                    });
                    await manager.save(SlotHistory, slotHistory);

                    slot.batteryId = battery.id;
                    slot.status = SlotStatus.CHARGING;
                    await manager.save(Slot, slot);

                    const currentCapacityPercent = battery.currentCapacity;
                    const percentToCharge = 100 - currentCapacityPercent;
                    const chargeRateHours =
                        battery.batteryType?.chargeRate || 2.5;

                    const hoursToFullCharge =
                        (percentToCharge / 100) * chargeRateHours;
                    const minutesToFullCharge = Math.ceil(
                        hoursToFullCharge * 60
                    );

                    battery.status = BatteryStatus.CHARGING;
                    battery.lastChargeTime = new Date();

                    const estimatedTime = new Date();
                    estimatedTime.setMinutes(
                        estimatedTime.getMinutes() + minutesToFullCharge
                    );
                    battery.estimatedFullChargeTime = estimatedTime;
                    await manager.save(Battery, battery);

                    return {
                        message: 'Bỏ pin cũ vào slot để sạc thành công'
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

            throw new BadRequestException(
                error?.message || 'Lỗi hệ thống khi bỏ pin vào slot'
            );
        }
    }
}
