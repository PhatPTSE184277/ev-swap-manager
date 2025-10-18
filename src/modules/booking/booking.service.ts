/* eslint-disable prefer-const */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking, Membership, UserMembership } from 'src/entities';
import { Between, DataSource, Like, Repository } from 'typeorm';
import { UserMembershipStatus } from '../../enums';

@Injectable()
export class BookingService {
    constructor(
        @InjectRepository(Booking)
        private readonly bookingRepository: Repository<Booking>,
        @InjectRepository(Membership)
        private readonly membershipRepository: Repository<Membership>,
        @InjectRepository(UserMembership)
        private readonly userMembershipRepository: Repository<UserMembership>,
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
        let where: any = { userVehicle: { userId } };

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
                oldBatteryPercent: detail.oldBatteryPercent,
                quantityBattery: detail.quantityBattery,
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
}
