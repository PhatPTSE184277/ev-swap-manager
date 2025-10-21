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
import {
    Between,
    DataSource,
    LessThan,
    Like,
    MoreThan,
    Repository
} from 'typeorm';
import { BatteryGateway } from 'src/gateways/battery.gateway';
import { SlotGateway } from 'src/gateways/slot.gateway';
import { CreateBookingDto } from './dto/create-booking.dto';
import { SlotStatus, UserMembershipStatus } from 'src/enums';
import Helpers from '../../utils/helpers';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BookingService {
    constructor(
        @InjectRepository(Booking)
        private readonly bookingRepository: Repository<Booking>,
        private readonly batteryGateway: BatteryGateway,
        private readonly slotGateway: SlotGateway,
        private readonly dataSource: DataSource
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async expireBookings() {
        const now = new Date();

        const expiredBookings = await this.bookingRepository.find({
            where: {
                expectedPickupTime: LessThan(now),
                status: BookingStatus.PENDING
            },
            relations: ['bookingDetails']
        });

        for (const booking of expiredBookings) {
            booking.status = BookingStatus.CANCELLED;
            await this.bookingRepository.save(booking);

            for (const detail of booking.bookingDetails) {
                detail.status = BookingDetailStatus.CANCELLED;
                await this.dataSource
                    .getRepository('BookingDetail')
                    .save(detail);

                const batteryRepo = this.dataSource.getRepository('Battery');
                const battery = await batteryRepo.findOne({
                    where: { id: detail.batteryId }
                });
                if (battery && battery.status === BatteryStatus.RESERVED) {
                    battery.status = BatteryStatus.AVAILABLE;
                    await batteryRepo.save(battery);
                }
                const slotRepo = this.dataSource.getRepository('Slot');
                const slot = await slotRepo.findOne({
                    where: { batteryId: detail.batteryId }
                });
                if (slot && slot.status === SlotStatus.RESERVED) {
                    slot.status = SlotStatus.AVAILABLE;
                    await slotRepo.save(slot);
                }
            }
        }
    }

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
                                expiredDate: MoreThan(now)
                            },
                            relations: ['membership']
                        }
                    );

                    if (!userMembership) {
                        throw new BadRequestException(
                            'Bạn chưa đăng ký gói thành viên!'
                        );
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

                    if (
                        !Helpers.isPickupTimeValid(
                            expectedPickupTime,
                            station.openTime,
                            station.closeTime
                        )
                    ) {
                        throw new BadRequestException(
                            'Thời gian dự kiến lấy pin không nằm trong giờ hoạt động của trạm'
                        );
                    }

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

                    const bookingData: any = {
                        userVehicleId: createBookingDto.userVehicleId,
                        stationId: createBookingDto.stationId,
                        expectedPickupTime,
                        status: BookingStatus.PENDING
                    };
                    if (userMembership) {
                        bookingData.userMembershipId = userMembership.id;
                    }
                    const booking = manager.create(Booking, bookingData);
                    await manager.save(Booking, booking);

                    for (const detail of createBookingDto.bookingDetails) {
                        const battery = await manager.findOne(Battery, {
                            where: {
                                id: detail.batteryId,
                                status: BatteryStatus.AVAILABLE
                            },
                            relations: ['batteryType']
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

                        const price = battery.batteryType?.pricePerSwap ?? 0;

                        const bookingDetail = manager.create('BookingDetail', {
                            bookingId: booking.id,
                            batteryId: detail.batteryId,
                            price: price,
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
        order: 'ASC' | 'DESC' = 'ASC',
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
                    'userMembership'
                ],
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: order }
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

    async getBookingsByUser(
        userId: number,
        page: number = 1,
        limit: number = 10,
        search?: string,
        month?: number,
        year?: number,
        order: 'ASC' | 'DESC' = 'DESC',
        status?: BookingStatus
    ): Promise<any> {
        try {
            const where: any = {};

            where.userVehicle = { user: { id: userId } };
            if (status) where.status = status;

            if (search) {
                where.userVehicle.name = Like(`%${search}%`);
            }

            if (month && year) {
                const start = new Date(year, month - 1, 1, 0, 0, 0);
                const end = new Date(year, month, 0, 23, 59, 59);
                where.createdAt = Between(start, end);
            } else if (year) {
                const start = new Date(year, 0, 1, 0, 0, 0);
                const end = new Date(year, 11, 31, 23, 59, 59);
                where.createdAt = Between(start, end);
            }

            const [data, total] = await this.bookingRepository.findAndCount({
                where,
                relations: [
                    'userVehicle',
                    'userVehicle.user',
                    'bookingDetails',
                    'bookingDetails.battery',
                    'bookingDetails.battery.batteryType',
                    'userMembership'
                ],
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: order }
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
            throw new InternalServerErrorException(
                error.message ||
                    'Lỗi hệ thống xảy ra khi lấy danh sách booking của người dùng'
            );
        }
    }
}
