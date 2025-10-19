import {
    Battery,
    Booking,
    Membership,
    Station,
    UserMembership,
    UserVehicle
} from 'src/entities';
import { BatteryStatus } from '../../enums/battery.enum';
import { BookingStatus } from '../../enums/booking.enum';
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
import { CreateBookingDto } from './dto/create-booking.dto';
import { SlotStatus } from 'src/enums';

@Injectable()
export class BookingService {
    constructor(
        @InjectRepository(Booking)
        private readonly bookingRepository: Repository<Booking>,
        @InjectRepository(Membership)
        private readonly membershipRepository: Repository<Membership>,
        @InjectRepository(UserMembership)
        private readonly userMembershipRepository: Repository<UserMembership>,
        @InjectRepository(Battery)
        private readonly batteryRepository: Repository<Battery>,
        @InjectRepository(Slot)
        private readonly slotRepository: Repository<Slot>,
        @InjectRepository(UserVehicle)
        private readonly userVehicleRepository: Repository<UserVehicle>,
        private readonly batteryGateway: BatteryGateway,
        private readonly dataSource: DataSource
    ) {}

    async getBookingsByUser(
        userId: number,
        page: number = 1,
        limit: number = 10,
        search?: string,
        month?: number,
        year?: number
    ): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        message: string;
    }> {
        const where: any = { userVehicle: { userId } };

        if (month && year) {
            const start = new Date(year, month - 1, 1, 0, 0, 0);
            const end = new Date(year, month, 0, 23, 59, 59, 999);
            where.createdAt = Between(start, end);
        } else if (year) {
            const start = new Date(year, 0, 1, 0, 0, 0);
            const end = new Date(year, 11, 31, 23, 59, 59, 999);
            where.createdAt = Between(start, end);
        }

        if (search) {
            where.userVehicle = {
                ...where.userVehicle,
                name: Like(`%${search}%`)
            };
        }

        const [data, total] = await this.bookingRepository.findAndCount({
            where,
            relations: ['userVehicle', 'bookingDetails'],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' }
        });

        const mappedData = data.map((booking) => ({
            id: booking.id,
            status: booking.status,
            createdAt: booking.createdAt,
            userVehicle: {
                id: booking.userVehicle?.id,
                name: booking.userVehicle?.name,
                vehicleTypeId: booking.userVehicle?.vehicleTypeId
            },
            bookingDetails: booking.bookingDetails?.map((detail) => ({
                id: detail.id,
                totalPrice: detail.totalPrice,
                status: detail.status
            }))
        }));

        return {
            data: mappedData,
            total,
            page,
            limit,
            message: 'Bookings retrieved successfully'
        };
    }

    async createBooking(
        userId,
        createBookingDto: CreateBookingDto
    ): Promise<any> {
        try {
            const result = await this.dataSource.transaction(
                async (manager) => {
                    const userVehicle = await manager.findOne(UserVehicle, {
                        where: {
                            id: createBookingDto.userVehicleId
                        }
                    });

                    if (!userVehicle || userVehicle.userId !== userId) {
                        throw new NotFoundException(
                            'Phương tiện của người dùng không tồn tại'
                        );
                    }

                    const station = await manager.findOne(Station, {
                        where: { id: createBookingDto.stationId }
                    });

                    if (!station) {
                        throw new NotFoundException('Trạm không tồn tại');
                    }

                    const battery = await manager.findOne(Battery, {
                        where: { id: createBookingDto.batteryId }
                    });
                    if (
                        !battery ||
                        battery.status !== BatteryStatus.AVAILABLE
                    ) {
                        throw new BadRequestException('Pin không khả dụng');
                    }

                    const newSlot = await manager.findOne(Slot, {
                        where: { id: createBookingDto.newBatterySlotId }
                    });
                    if (
                        !newSlot ||
                        (newSlot.status !== SlotStatus.FULL &&
                            newSlot.status !== SlotStatus.CHARGING)
                    ) {
                        throw new BadRequestException(
                            'Slot không có pin sẵn sàng'
                        );
                    }

                    const oldSlot = await manager.findOne(Slot, {
                        where: { id: createBookingDto.oldBatterySlotId }
                    });
                    if (!oldSlot || oldSlot.status !== SlotStatus.EMPTY) {
                        throw new BadRequestException(
                            'Slot không trống để bỏ pin cũ'
                        );
                    }
                }
            );
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Đã xảy ra lỗi khi tạo đặt lịch'
            );
        }
    }
}
