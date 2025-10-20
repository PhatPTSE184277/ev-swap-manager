import {
    Battery,
    Booking,
    Station,
    UserMembership,
    UserVehicle
} from 'src/entities';
import { BatteryStatus } from '../../enums/battery.enum';
import { BookingDetailStatus, BookingStatus } from '../../enums/booking.enum';
import { Slot } from 'src/entities';
import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, Like, Repository } from 'typeorm';
import { BatteryGateway } from 'src/gateways/battery.gateway';
import { SlotGateway } from 'src/gateways/slot.gateway';
import { CreateBookingDto } from './dto/create-booking.dto';
import { SlotStatus, UserMembershipStatus } from 'src/enums';
import Helpers from '../../utils/helpers';

@Injectable()
export class BookingService {
    constructor(
        @InjectRepository(Booking)
        private readonly bookingRepository: Repository<Booking>,
        private readonly batteryGateway: BatteryGateway,
        private readonly slotGateway: SlotGateway,
        private readonly dataSource: DataSource
    ) {}

    async createBooking(
        userId: number,
        createBookingDto: CreateBookingDto
    ): Promise<any> {
        try {
            const result = await this.dataSource.transaction(
                async (manager) => {
                    const userVehicle = await manager.findOne(UserVehicle, {
                        where: {
                            id: createBookingDto.userVehicleId,
                            userId: userId
                        }
                    });
                    if (!userVehicle) {
                        throw new NotFoundException(
                            'Xe của người dùng không tồn tại'
                        );
                    }

                    const station = await manager.findOne(Station, {
                        where: { id: createBookingDto.stationId }
                    });

                    if (!station) {
                        throw new NotFoundException(
                            'Trạm đổi pin không tồn tại'
                        );
                    }

                    const now = new Date();
                    const userMembership = await manager.findOne(
                        UserMembership,
                        {
                            where: {
                                userId: userId,
                                status: UserMembershipStatus.ACTIVE,
                                expiredDate: Between(
                                    now,
                                    new Date(8640000000000000)
                                )
                            },
                            relations: ['membership']
                        }
                    );

                    if (userMembership) {
                        if (
                            userMembership.remainingSwaps <
                            createBookingDto.bookingDetails.length
                        ) {
                            throw new BadRequestException(
                                `Bạn chỉ còn ${userMembership.remainingSwaps} lượt đổi pin`
                            );
                        }

                        userMembership.remainingSwaps -=
                            createBookingDto.bookingDetails.length;
                        await manager.save(UserMembership, userMembership);
                    }

                    const distance = Helpers.calcDistance(
                        createBookingDto.userLat,
                        createBookingDto.userLng,
                        station.latitude,
                        station.longitude
                    );
                    const avgSpeed = 40;
                    const travelMinutes: number =
                        Math.ceil((distance / avgSpeed) * 60) + 20;

                    const expectedPickupTime = new Date(
                        now.getTime() + travelMinutes * 60 * 1000
                    );

                    const booking = manager.create(Booking, {
                        userVehicleId: createBookingDto.userVehicleId,
                        stationId: createBookingDto.stationId,
                        expectedPickupTime,
                        status: BookingStatus.PENDING
                    });
                    await manager.save(Booking, booking);

                    for (const detail of createBookingDto.bookingDetails) {
                        const battery = await manager.findOne(Battery, {
                            where: {
                                id: detail.batteryId,
                                status: BatteryStatus.AVAILABLE
                            },
                            relations: ['batteryType'] // <-- Thêm quan hệ này để lấy batteryType
                        });

                        if (!battery) {
                            throw new BadRequestException(
                                `Pin ${detail.batteryId} không khả dụng`
                            );
                        }

                        const slot = await manager.findOne(Slot, {
                            where: {
                                batteryId: detail.batteryId,
                                status: SlotStatus.AVAILABLE
                            }
                        });

                        if (!slot) {
                            throw new BadRequestException(
                                `Slot cho pin ${detail.batteryId} không khả dụng`
                            );
                        }

                        battery.status = BatteryStatus.RESERVED;
                        await manager.save(Battery, battery);

                        slot.status = SlotStatus.RESERVED;
                        await manager.save(Slot, slot);

                        // const price =
                        //     typeof detail. === 'number'
                        //         ? detail.price
                        //         : (battery.batteryType?.pricePerSwap ??
                        //           battery.price);

                        const bookingDetail = manager.create('BookingDetail', {
                            bookingId: booking.id,
                            batteryId: detail.batteryId,
                            // price: price,
                            status: BookingDetailStatus.PENDING
                        });
                        await manager.save('BookingDetail', bookingDetail);

                        this.batteryGateway.emitBatteryReserved({
                            batteryId: battery.id,
                            stationId: station.id
                        });

                        this.slotGateway.emitSlotReserved({
                            slotId: slot.id,
                            stationId: station.id
                        });
                    }

                    return {
                        message: 'Đặt lịch thành công',
                        bookingId: booking.id,
                        expectedPickupTime,
                        distance: Number(distance.toFixed(2)),
                        travelMinutes
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

            throw new InternalServerErrorException(
                error.message || 'Lỗi hệ thống xảy ra khi tạo booking'
            );
        }
    }

    async getAllBookingsForAdmin(
        page: number = 1,
        limit: number = 10,
        search?: string,
        status?: BookingStatus
    ): Promise<any> {
        try {
            const where: any = {};
            if (status) where.status = status;

            if (search) {
                where.userVehicle = {
                    name: Like(`%${search}%`)
                };
            }

            const [data, total] = await this.bookingRepository.findAndCount({
                where,
                relations: [
                    'userVehicle',
                    'userVehicle.user',
                    'bookingDetails',
                    'bookingDetails.battery',
                    'bookingDetails.battery.batteryType',
                    'userMembership',
                    'station'
                ],
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: 'DESC' }
            });

            const mappedData = data.map((booking) => ({
                id: booking.id,
                status: booking.status,
                expectedPickupTime: booking.expectedPickupTime,
                createdAt: booking.createdAt,
                user: {
                    id: booking.userVehicle?.user?.id,
                    username: booking.userVehicle?.user?.username,
                    email: booking.userVehicle?.user?.email
                },
                userVehicle: {
                    id: booking.userVehicle?.id,
                    name: booking.userVehicle?.name
                },
                bookingDetails: booking.bookingDetails?.map((detail) => ({
                    id: detail.id,
                    batteryId: detail.batteryId,
                    price: detail.price,
                    status: detail.status
                }))
            }));

            return {
                data: mappedData,
                total,
                page,
                limit,
                message: 'Lấy danh sách booking thành công'
            };
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }

            throw new InternalServerErrorException(
                error.message || 'Lỗi hệ thống xảy ra khi lấy danh sách booking'
            );
        }
    }
}
