import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import {
    Role,
    User,
    Membership,
    UserMembership,
    Station,
    StationStaff,
    StationStaffHistory,
    Cabinet,
    CabinetHistory,
    Slot,
    SlotHistory,
    BatteryType,
    Battery,
    BatteryUsedHistory,
    VehicleType,
    UserVehicle,
    Payment,
    Transaction,
    Booking,
    BookingDetail,
    Feedback
} from 'src/entities';
import { seedData } from './seed-data';

@Injectable()
export class SeedService {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Membership)
        private readonly membershipRepository: Repository<Membership>,
        @InjectRepository(UserMembership)
        private readonly userMembershipRepository: Repository<UserMembership>,
        @InjectRepository(Station)
        private readonly stationRepository: Repository<Station>,
        @InjectRepository(StationStaff)
        private readonly stationStaffRepository: Repository<StationStaff>,
        @InjectRepository(StationStaffHistory)
        private readonly stationStaffHistoryRepository: Repository<StationStaffHistory>,
        @InjectRepository(Cabinet)
        private readonly cabinetRepository: Repository<Cabinet>,
        @InjectRepository(CabinetHistory)
        private readonly cabinetHistoryRepository: Repository<CabinetHistory>,
        @InjectRepository(Slot)
        private readonly slotRepository: Repository<Slot>,
        @InjectRepository(SlotHistory)
        private readonly slotHistoryRepository: Repository<SlotHistory>,
        @InjectRepository(BatteryType)
        private readonly batteryTypeRepository: Repository<BatteryType>,
        @InjectRepository(Battery)
        private readonly batteryRepository: Repository<Battery>,
        @InjectRepository(BatteryUsedHistory)
        private readonly batteryUsedHistoryRepository: Repository<BatteryUsedHistory>,
        @InjectRepository(VehicleType)
        private readonly vehicleTypeRepository: Repository<VehicleType>,
        @InjectRepository(UserVehicle)
        private readonly userVehicleRepository: Repository<UserVehicle>,
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        @InjectRepository(Booking)
        private readonly bookingRepository: Repository<Booking>,
        @InjectRepository(BookingDetail)
        private readonly bookingDetailRepository: Repository<BookingDetail>,
        @InjectRepository(Feedback)
        private readonly feedbackRepository: Repository<Feedback>,
        private readonly dataSource: DataSource
    ) {}

    private async seedRoles(manager) {
        await manager.getRepository(Role).save(seedData.roles);
    }

    private async seedUsers(manager) {
        const usersWithHashedPassword = seedData.users.map((user) => {
            const hashedPassword = bcrypt.hashSync(user.password, 10);
            return { ...user, password: hashedPassword };
        });
        await manager.getRepository(User).save(usersWithHashedPassword);
    }

    private async seedMemberships(manager) {
        await manager.getRepository(Membership).save(seedData.memberships);
    }

    private async seedUserMemberships(manager) {
        await manager
            .getRepository(UserMembership)
            .save(seedData.userMemberships);
    }

    private async seedStations(manager) {
        await manager.getRepository(Station).save(seedData.stations);
    }

    private async seedStationStaffs(manager) {
        await manager.getRepository(StationStaff).save(seedData.stationStaffs);
    }

    private async seedStationStaffHistories(manager) {
        await manager
            .getRepository(StationStaffHistory)
            .save(seedData.stationStaffHistories);
    }

    private async seedCabinets(manager) {
        await manager.getRepository(Cabinet).save(seedData.cabinets);
    }

    private async seedCabinetHistories(manager) {
        await manager
            .getRepository(CabinetHistory)
            .save(seedData.cabinetHistories);
    }

    private async seedSlots(manager) {
        await manager.getRepository(Slot).save(seedData.slots);
    }

    private async seedSlotHistories(manager) {
        await manager.getRepository(SlotHistory).save(seedData.slotHistories);
    }

    private async seedBatteryTypes(manager) {
        await manager.getRepository(BatteryType).save(seedData.batteryTypes);
    }

    private async seedBatteries(manager) {
        await manager.getRepository(Battery).save(seedData.batteries);
    }

    private async seedBatteryUsedHistories(manager) {
        await manager
            .getRepository(BatteryUsedHistory)
            .save(seedData.batteryUsedHistories);
    }

    private async seedVehicleTypes(manager) {
        await manager.getRepository(VehicleType).save(seedData.vehicleTypes);
    }

    private async seedUserVehicles(manager) {
        await manager.getRepository(UserVehicle).save(seedData.userVehicles);
    }

    private async seedPayments(manager) {
        await manager.getRepository(Payment).save(seedData.payments);
    }

    private async seedTransactions(manager) {
        await manager.getRepository(Transaction).save(seedData.transactions);
    }

    private async seedBookings(manager) {
        await manager.getRepository(Booking).save(seedData.bookings);
    }

    private async seedBookingDetails(manager) {
        await manager
            .getRepository(BookingDetail)
            .save(seedData.bookingDetails);
    }

    private async seedFeedbacks(manager) {
        await manager.getRepository(Feedback).save(seedData.feedbacks);
    }

    async initSeedData() {
        try {
            await this.dataSource.transaction(async (manager) => {
                // Tắt kiểm tra khóa ngoại
                await manager.query('SET FOREIGN_KEY_CHECKS = 0');

                // Xóa dữ liệu theo thứ tự ngược lại
                await manager.query('TRUNCATE TABLE feedbacks');
                await manager.query('TRUNCATE TABLE battery_used_histories');
                await manager.query('TRUNCATE TABLE booking_details');
                await manager.query('TRUNCATE TABLE bookings');
                await manager.query('TRUNCATE TABLE transactions');
                await manager.query('TRUNCATE TABLE user_vehicles');
                await manager.query('TRUNCATE TABLE slot_histories');
                await manager.query('TRUNCATE TABLE slots');
                await manager.query('TRUNCATE TABLE batteries');
                await manager.query('TRUNCATE TABLE battery_types');
                await manager.query('TRUNCATE TABLE vehicle_types');
                await manager.query('TRUNCATE TABLE cabinet_histories');
                await manager.query('TRUNCATE TABLE cabinets');
                await manager.query('TRUNCATE TABLE station_staff_histories');
                await manager.query('TRUNCATE TABLE station_staffs');
                await manager.query('TRUNCATE TABLE stations');
                await manager.query('TRUNCATE TABLE user_memberships');
                await manager.query('TRUNCATE TABLE memberships');
                await manager.query('TRUNCATE TABLE payments');
                await manager.query('TRUNCATE TABLE users');
                await manager.query('TRUNCATE TABLE roles');

                // Bật lại kiểm tra khóa ngoại
                await manager.query('SET FOREIGN_KEY_CHECKS = 1');

                // Seed dữ liệu theo đúng thứ tự (sửa lại)
                await this.seedRoles(manager);
                await this.seedUsers(manager);
                await this.seedMemberships(manager);
                await this.seedUserMemberships(manager);
                await this.seedStations(manager);
                await this.seedStationStaffs(manager);
                await this.seedStationStaffHistories(manager);
                await this.seedCabinets(manager);
                await this.seedCabinetHistories(manager);
                await this.seedBatteryTypes(manager); // di chuyển lên trước
                await this.seedBatteries(manager); // di chuyển lên trước
                await this.seedSlots(manager); // sau batteries
                await this.seedSlotHistories(manager);
                await this.seedVehicleTypes(manager);
                await this.seedUserVehicles(manager);
                await this.seedPayments(manager);
                await this.seedTransactions(manager);
                await this.seedBookings(manager);
                await this.seedBookingDetails(manager);
                await this.seedBatteryUsedHistories(manager);
                await this.seedFeedbacks(manager);
            });
            return { message: 'Seeding completed successfully' };
        } catch (error) {
            return { message: 'Seeding failed', error: error.message };
        }
    }
}
