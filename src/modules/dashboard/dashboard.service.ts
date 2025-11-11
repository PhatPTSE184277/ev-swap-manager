import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Station, User, Booking, UserMembership } from 'src/entities';
import { RoleName, BookingStatus, UserMembershipStatus } from 'src/enums';
import { Between, Repository } from 'typeorm';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Station)
        private readonly stationRepository: Repository<Station>,
        @InjectRepository(Booking)
        private readonly bookingRepository: Repository<Booking>,
        @InjectRepository(UserMembership)
        private readonly userMembershipRepository: Repository<UserMembership>,
    ) {}

    async countUsers(): Promise<any> {
        try {
            const countUsers = await this.userRepository.count({
                where: {
                    role: { name: RoleName.USER }
                }
            });
            return { countUsers, message: 'Lấy số lượng user thành công' };
        } catch (error) {
            throw new InternalServerErrorException('Lỗi khi lấy số lượng user');
        }
    }

    async countStations(): Promise<any> {
        try {
            const countStations = await this.stationRepository.count();
            return { countStations, message: 'Lấy số lượng trạm thành công' };
        } catch (error) {
            throw new InternalServerErrorException('Lỗi khi lấy số lượng trạm');
        }
    }

    async countActiveBookingsByMonthYear(month: number, year: number): Promise<any> {
        try {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 1);

            const count = await this.bookingRepository.count({
                where: {
                    status: BookingStatus.COMPLETED,
                    createdAt: Between(startDate, endDate)
                }
            });

            return {
                count,
                message: `Số lượng booking COMPLETED trong tháng ${month}/${year}`
            };
        } catch (error) {
            throw new InternalServerErrorException('Lỗi khi đếm booking COMPLETED theo tháng/năm');
        }
    }

    async countActiveUserMembershipsByMonthYear(month: number, year: number): Promise<any> {
        try {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 1);

            const count = await this.userMembershipRepository.count({
                where: {
                    status: UserMembershipStatus.ACTIVE,
                    createdAt: Between(startDate, endDate)
                }
            });

            return {
                count,
                message: `Số lượng user membership ACTIVE trong tháng ${month}/${year}`
            };
        } catch (error) {
            throw new InternalServerErrorException('Lỗi khi đếm user membership ACTIVE theo tháng/năm');
        }
    }
}