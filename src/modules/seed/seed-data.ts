import { RoleName } from '../../enums/role.enum';
import { UserStatus } from '../../enums/user.enum';
import { UserMembershipStatus } from '../../enums/membership.enum';
import { StaffHistoryShift } from '../../enums/station.enum';
import { BatteryStatus } from '../../enums/battery.enum';
import { SlotStatus } from '../../enums/slot.enum';
import { BookingStatus, BookingDetailStatus } from '../../enums/booking.enum';
import { TransactionStatus } from '../../enums/transaction.enum';

export const seedData = {
    roles: [
        {
            id: 1,
            name: RoleName.ADMIN,
            description: 'Quản trị viên hệ thống',
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            name: RoleName.USER,
            description: 'Người dùng thông thường',
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 3,
            name: RoleName.STAFF,
            description: 'Nhân viên trạm',
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],

    users: [
        {
            id: 1,
            username: 'admin',
            password: 'admin123',
            email: 'admin@evswap.com',
            fullName: 'Quản trị viên',
            status: UserStatus.VERIFIED,
            roleId: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            username: 'user1',
            password: 'user123',
            email: 'user1@example.com',
            fullName: 'Nguyễn Văn A',
            status: UserStatus.VERIFIED,
            roleId: 2,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 3,
            username: 'user2',
            password: 'user123',
            email: 'user2@example.com',
            fullName: 'Trần Thị B',
            status: UserStatus.VERIFIED,
            roleId: 2,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 4,
            username: 'staff1',
            password: 'staff123',
            email: 'staff1@evswap.com',
            fullName: 'Lê Văn C',
            status: UserStatus.VERIFIED,
            roleId: 3,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 5,
            username: 'staff2',
            password: 'staff123',
            email: 'staff2@evswap.com',
            fullName: 'Phạm Thị D',
            status: UserStatus.VERIFIED,
            roleId: 3,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],

    memberships: [
        {
            id: 1,
            name: 'Basic',
            description: 'Gói cơ bản - 10 lần đổi pin/tháng',
            price: 10000,
            duration: 30,
            swapLimit: 10,
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            name: 'Premium',
            description: 'Gói cao cấp - 30 lần đổi pin/tháng',
            price: 15000,
            duration: 30,
            swapLimit: 30,
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 3,
            name: 'VIP',
            description: 'Gói VIP - Không giới hạn đổi pin',
            price: 20000,
            duration: 30,
            swapLimit: null,
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],

    userMemberships: [
        {
            id: 1,
            userId: 2,
            membershipId: 1,
            expiredDate: new Date('2025-10-01'),
            remainingSwaps: 10,
            status: UserMembershipStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
            paymentExpireAt: null
        },
        {
            id: 2,
            userId: 3,
            membershipId: 2,
            expiredDate: new Date('2025-11-15'),
            remainingSwaps: 30,
            status: UserMembershipStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
            paymentExpireAt: null
        },
        {
            id: 3,
            userId: 2,
            membershipId: 2,
            expiredDate: new Date('2025-12-01'),
            remainingSwaps: 30,
            status: UserMembershipStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
            paymentExpireAt: null
        }
    ],

    stations: [
        {
            id: 1,
            name: 'Trạm Quận 1',
            description: 'Trạm đổi pin trung tâm quận 1',
            address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
            latitude: 10.7769,
            longitude: 106.7009,
            temperature: 26.5,
            openTime: '06:00:00',
            closeTime: '22:00:00',
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            name: 'Trạm Quận 3',
            description: 'Trạm đổi pin quận 3',
            address: '456 Võ Văn Tần, Phường 6, Quận 3, TP.HCM',
            latitude: 10.7769,
            longitude: 106.6919,
            temperature: 27.2,
            openTime: '07:00:00',
            closeTime: '21:00:00',
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],

    stationStaffs: [
        {
            id: 1,
            userId: 4,
            stationId: 1,
            isHead: true,
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            userId: 5,
            stationId: 2,
            isHead: false,
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],

    stationStaffHistories: [
        {
            id: 1,
            stationStaffId: 1,
            stationId: 1,
            date: new Date('2024-09-30'),
            shift: StaffHistoryShift.MORNING,
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            stationStaffId: 1,
            stationId: 1,
            date: new Date('2024-09-30'),
            shift: StaffHistoryShift.AFTERNOON,
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],

    cabinets: [
        {
            id: 1,
            name: 'Tủ 1',
            stationId: 1,
            batteryTypeId: 1,
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            name: 'Tủ 2',
            stationId: 1,
            batteryTypeId: 1,
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 3,
            name: 'Tủ 1',
            stationId: 2,
            batteryTypeId: 2,
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],

    cabinetHistories: [
        {
            id: 1,
            cabinetId: 1,
            stationId: 1,
            dateChange: new Date('2024-09-30T08:00:00'),
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],

    batteryTypes: [
        {
            id: 1,
            name: 'Li-ion 48V Standard',
            description: 'Pin lithium-ion 48V tiêu chuẩn cho xe máy điện',
            capacityKWh: 2.0,
            cycleLife: 1000,
            chargeRate: 2.5,
            pricePerSwap: 50000,
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            name: 'Li-ion 60V Premium',
            description: 'Pin lithium-ion 60V cao cấp cho xe máy điện',
            capacityKWh: 3.0,
            cycleLife: 1200,
            chargeRate: 3.0,
            pricePerSwap: 50000,
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],

    vehicleTypes: [
        {
            id: 1,
            batteryTypeId: 1,
            model: 'Xe máy điện cơ bản',
            description: 'Xe máy điện dành cho di chuyển trong thành phố',
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            batteryTypeId: 2,
            model: 'Xe máy điện cao cấp',
            description: 'Xe máy điện hiệu năng cao, tốc độ nhanh',
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],

    userVehicles: [
        {
            id: 1,
            userId: 2,
            vehicleTypeId: 1,
            name: 'Vinfast Evo 200 - Nguyễn Văn A',
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            userId: 3,
            vehicleTypeId: 2,
            name: 'Yadea G5 - Trần Thị B',
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],

    batteries: [
        // Batteries cho Cabinet 1 (batteryTypeId: 1, stationId: 1) - 10 batteries
        {
            id: 1,
            batteryTypeId: 1,
            model: 'BAT48V001',
            currentCycle: 150,
            currentCapacity: 90,
            healthScore: 90,
            lastChargeTime: new Date('2025-10-27T08:00:00'),
            estimatedFullChargeTime: new Date('2025-10-27T10:30:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            batteryTypeId: 1,
            model: 'BAT48V002',
            currentCycle: 50,
            currentCapacity: 100,
            healthScore: 95,
            lastChargeTime: new Date('2025-10-27T09:00:00'),
            estimatedFullChargeTime: new Date('2025-10-27T11:00:00'),
            status: BatteryStatus.CHARGING,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 3,
            batteryTypeId: 1,
            model: 'BAT48V003',
            currentCycle: 200,
            currentCapacity: 85,
            healthScore: 85,
            lastChargeTime: new Date('2025-10-27T07:30:00'),
            estimatedFullChargeTime: new Date('2025-10-27T10:00:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 4,
            batteryTypeId: 1,
            model: 'BAT48V004',
            currentCycle: 100,
            currentCapacity: 95,
            healthScore: 92,
            lastChargeTime: new Date('2025-10-27T08:30:00'),
            estimatedFullChargeTime: new Date('2025-10-27T11:00:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 5,
            batteryTypeId: 1,
            model: 'BAT48V005',
            currentCycle: 300,
            currentCapacity: 75,
            healthScore: 78,
            lastChargeTime: new Date('2025-10-27T06:00:00'),
            estimatedFullChargeTime: new Date('2025-10-27T08:30:00'),
            status: BatteryStatus.CHARGING,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 6,
            batteryTypeId: 1,
            model: 'BAT48V006',
            currentCycle: 120,
            currentCapacity: 88,
            healthScore: 88,
            lastChargeTime: new Date('2025-10-27T09:30:00'),
            estimatedFullChargeTime: new Date('2025-10-27T12:00:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 7,
            batteryTypeId: 1,
            model: 'BAT48V007',
            currentCycle: 80,
            currentCapacity: 98,
            healthScore: 96,
            lastChargeTime: new Date('2025-10-27T10:00:00'),
            estimatedFullChargeTime: new Date('2025-10-27T12:30:00'),
            status: BatteryStatus.RESERVED,
            userVehicleId: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 8,
            batteryTypeId: 1,
            model: 'BAT48V008',
            currentCycle: 500,
            currentCapacity: 60,
            healthScore: 65,
            lastChargeTime: new Date('2025-10-26T22:00:00'),
            estimatedFullChargeTime: null,
            status: BatteryStatus.MAINTENANCE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 9,
            batteryTypeId: 1,
            model: 'BAT48V009',
            currentCycle: 180,
            currentCapacity: 82,
            healthScore: 83,
            lastChargeTime: new Date('2025-10-27T07:00:00'),
            estimatedFullChargeTime: new Date('2025-10-27T09:30:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 10,
            batteryTypeId: 1,
            model: 'BAT48V010',
            currentCycle: 250,
            currentCapacity: 78,
            healthScore: 80,
            lastChargeTime: new Date('2025-10-27T08:15:00'),
            estimatedFullChargeTime: new Date('2025-10-27T10:45:00'),
            status: BatteryStatus.CHARGING,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },

        // Batteries cho Cabinet 2 (batteryTypeId: 1, stationId: 1) - 8 batteries
        {
            id: 11,
            batteryTypeId: 1,
            model: 'BAT48V011',
            currentCycle: 90,
            currentCapacity: 92,
            healthScore: 91,
            lastChargeTime: new Date('2025-10-27T09:00:00'),
            estimatedFullChargeTime: new Date('2025-10-27T11:30:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 12,
            batteryTypeId: 1,
            model: 'BAT48V012',
            currentCycle: 400,
            currentCapacity: 68,
            healthScore: 70,
            lastChargeTime: new Date('2025-10-27T06:30:00'),
            estimatedFullChargeTime: new Date('2025-10-27T09:00:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 13,
            batteryTypeId: 1,
            model: 'BAT48V013',
            currentCycle: 150,
            currentCapacity: 86,
            healthScore: 87,
            lastChargeTime: new Date('2025-10-27T10:30:00'),
            estimatedFullChargeTime: new Date('2025-10-27T13:00:00'),
            status: BatteryStatus.CHARGING,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 14,
            batteryTypeId: 1,
            model: 'BAT48V014',
            currentCycle: 110,
            currentCapacity: 90,
            healthScore: 89,
            lastChargeTime: new Date('2025-10-27T08:45:00'),
            estimatedFullChargeTime: new Date('2025-10-27T11:15:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 15,
            batteryTypeId: 1,
            model: 'BAT48V015',
            currentCycle: 70,
            currentCapacity: 100,
            healthScore: 97,
            lastChargeTime: new Date('2025-10-27T09:15:00'),
            estimatedFullChargeTime: new Date('2025-10-27T11:45:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 16,
            batteryTypeId: 1,
            model: 'BAT48V016',
            currentCycle: 600,
            currentCapacity: 55,
            healthScore: 58,
            lastChargeTime: new Date('2025-10-26T20:00:00'),
            estimatedFullChargeTime: null,
            status: BatteryStatus.DAMAGED,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 17,
            batteryTypeId: 1,
            model: 'BAT48V017',
            currentCycle: 220,
            currentCapacity: 80,
            healthScore: 82,
            lastChargeTime: new Date('2025-10-27T07:45:00'),
            estimatedFullChargeTime: new Date('2025-10-27T10:15:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 18,
            batteryTypeId: 1,
            model: 'BAT48V018',
            currentCycle: 130,
            currentCapacity: 88,
            healthScore: 86,
            lastChargeTime: new Date('2025-10-27T08:00:00'),
            estimatedFullChargeTime: new Date('2025-10-27T10:30:00'),
            status: BatteryStatus.CHARGING,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },

        // Batteries cho Cabinet 3 (batteryTypeId: 2, stationId: 2) - 12 batteries
        {
            id: 19,
            batteryTypeId: 2,
            model: 'BAT60V001',
            currentCycle: 900,
            currentCapacity: 50,
            healthScore: 55,
            lastChargeTime: new Date('2025-10-27T10:00:00'),
            estimatedFullChargeTime: new Date('2025-10-27T13:00:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 20,
            batteryTypeId: 2,
            model: 'BAT60V002',
            currentCycle: 100,
            currentCapacity: 95,
            healthScore: 93,
            lastChargeTime: new Date('2025-10-27T09:00:00'),
            estimatedFullChargeTime: new Date('2025-10-27T12:00:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 21,
            batteryTypeId: 2,
            model: 'BAT60V003',
            currentCycle: 50,
            currentCapacity: 100,
            healthScore: 98,
            lastChargeTime: new Date('2025-10-27T10:30:00'),
            estimatedFullChargeTime: new Date('2025-10-27T13:30:00'),
            status: BatteryStatus.CHARGING,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 22,
            batteryTypeId: 2,
            model: 'BAT60V004',
            currentCycle: 200,
            currentCapacity: 88,
            healthScore: 86,
            lastChargeTime: new Date('2025-10-27T08:30:00'),
            estimatedFullChargeTime: new Date('2025-10-27T11:30:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 23,
            batteryTypeId: 2,
            model: 'BAT60V005',
            currentCycle: 150,
            currentCapacity: 90,
            healthScore: 89,
            lastChargeTime: new Date('2025-10-27T07:00:00'),
            estimatedFullChargeTime: new Date('2025-10-27T10:00:00'),
            status: BatteryStatus.IN_USE,
            userVehicleId: 2,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 24,
            batteryTypeId: 2,
            model: 'BAT60V006',
            currentCycle: 80,
            currentCapacity: 98,
            healthScore: 95,
            lastChargeTime: new Date('2025-10-27T09:30:00'),
            estimatedFullChargeTime: new Date('2025-10-27T12:30:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 25,
            batteryTypeId: 2,
            model: 'BAT60V007',
            currentCycle: 300,
            currentCapacity: 75,
            healthScore: 77,
            lastChargeTime: new Date('2025-10-27T06:00:00'),
            estimatedFullChargeTime: new Date('2025-10-27T09:00:00'),
            status: BatteryStatus.CHARGING,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 26,
            batteryTypeId: 2,
            model: 'BAT60V008',
            currentCycle: 120,
            currentCapacity: 92,
            healthScore: 90,
            lastChargeTime: new Date('2025-10-27T08:00:00'),
            estimatedFullChargeTime: new Date('2025-10-27T11:00:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 27,
            batteryTypeId: 2,
            model: 'BAT60V009',
            currentCycle: 400,
            currentCapacity: 68,
            healthScore: 70,
            lastChargeTime: new Date('2025-10-26T22:00:00'),
            estimatedFullChargeTime: null,
            status: BatteryStatus.MAINTENANCE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 28,
            batteryTypeId: 2,
            model: 'BAT60V010',
            currentCycle: 180,
            currentCapacity: 85,
            healthScore: 84,
            lastChargeTime: new Date('2025-10-27T09:45:00'),
            estimatedFullChargeTime: new Date('2025-10-27T12:45:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 29,
            batteryTypeId: 2,
            model: 'BAT60V011',
            currentCycle: 250,
            currentCapacity: 78,
            healthScore: 79,
            lastChargeTime: new Date('2025-10-27T07:30:00'),
            estimatedFullChargeTime: new Date('2025-10-27T10:30:00'),
            status: BatteryStatus.CHARGING,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 30,
            batteryTypeId: 2,
            model: 'BAT60V012',
            currentCycle: 90,
            currentCapacity: 96,
            healthScore: 94,
            lastChargeTime: new Date('2025-10-27T10:15:00'),
            estimatedFullChargeTime: new Date('2025-10-27T13:15:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],

    slots: [
        // Slots cho Cabinet 1 - 12 slots (10 có pin, 2 empty)
        {
            id: 1,
            cabinetId: 1,
            name: 'Slot 1',
            batteryId: 1,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            cabinetId: 1,
            name: 'Slot 2',
            batteryId: 2,
            status: SlotStatus.CHARGING,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 3,
            cabinetId: 1,
            name: 'Slot 3',
            batteryId: 3,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 4,
            cabinetId: 1,
            name: 'Slot 4',
            batteryId: 4,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 5,
            cabinetId: 1,
            name: 'Slot 5',
            batteryId: 5,
            status: SlotStatus.CHARGING,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 6,
            cabinetId: 1,
            name: 'Slot 6',
            batteryId: 6,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 7,
            cabinetId: 1,
            name: 'Slot 7',
            batteryId: 7,
            status: SlotStatus.RESERVED,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 8,
            cabinetId: 1,
            name: 'Slot 8',
            batteryId: 8,
            status: SlotStatus.MAINTENANCE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 9,
            cabinetId: 1,
            name: 'Slot 9',
            batteryId: 9,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 10,
            cabinetId: 1,
            name: 'Slot 10',
            batteryId: 10,
            status: SlotStatus.CHARGING,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 11,
            cabinetId: 1,
            name: 'Slot 11',
            batteryId: null,
            status: SlotStatus.EMPTY,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 12,
            cabinetId: 1,
            name: 'Slot 12',
            batteryId: null,
            status: SlotStatus.EMPTY,
            createdAt: new Date(),
            updatedAt: new Date()
        },


        {
            id: 13,
            cabinetId: 2,
            name: 'Slot 1',
            batteryId: 11,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 14,
            cabinetId: 2,
            name: 'Slot 2',
            batteryId: 12,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 15,
            cabinetId: 2,
            name: 'Slot 3',
            batteryId: 13,
            status: SlotStatus.CHARGING,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 16,
            cabinetId: 2,
            name: 'Slot 4',
            batteryId: 14,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 17,
            cabinetId: 2,
            name: 'Slot 5',
            batteryId: 15,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 18,
            cabinetId: 2,
            name: 'Slot 6',
            batteryId: 16,
            status: SlotStatus.MAINTENANCE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 19,
            cabinetId: 2,
            name: 'Slot 7',
            batteryId: 17,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 20,
            cabinetId: 2,
            name: 'Slot 8',
            batteryId: 18,
            status: SlotStatus.CHARGING,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 21,
            cabinetId: 2,
            name: 'Slot 9',
            batteryId: null,
            status: SlotStatus.EMPTY,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 22,
            cabinetId: 2,
            name: 'Slot 10',
            batteryId: null,
            status: SlotStatus.EMPTY,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 23,
            cabinetId: 2,
            name: 'Slot 11',
            batteryId: null,
            status: SlotStatus.EMPTY,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 24,
            cabinetId: 2,
            name: 'Slot 12',
            batteryId: null,
            status: SlotStatus.EMPTY,
            createdAt: new Date(),
            updatedAt: new Date()
        },

        // Slots cho Cabinet 3 - 12 slots (12 có pin, 0 empty)
        {
            id: 25,
            cabinetId: 3,
            name: 'Slot 1',
            batteryId: 19,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 26,
            cabinetId: 3,
            name: 'Slot 2',
            batteryId: 20,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 27,
            cabinetId: 3,
            name: 'Slot 3',
            batteryId: 21,
            status: SlotStatus.CHARGING,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 28,
            cabinetId: 3,
            name: 'Slot 4',
            batteryId: 22,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 29,
            cabinetId: 3,
            name: 'Slot 5',
            batteryId: null,
            status: SlotStatus.EMPTY,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 30,
            cabinetId: 3,
            name: 'Slot 6',
            batteryId: 24,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 31,
            cabinetId: 3,
            name: 'Slot 7',
            batteryId: 25,
            status: SlotStatus.CHARGING,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 32,
            cabinetId: 3,
            name: 'Slot 8',
            batteryId: 26,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 33,
            cabinetId: 3,
            name: 'Slot 9',
            batteryId: 27,
            status: SlotStatus.MAINTENANCE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 34,
            cabinetId: 3,
            name: 'Slot 10',
            batteryId: 28,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 35,
            cabinetId: 3,
            name: 'Slot 11',
            batteryId: 29,
            status: SlotStatus.CHARGING,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 36,
            cabinetId: 3,
            name: 'Slot 12',
            batteryId: 30,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],

    slotHistories: [
        {
            id: 1,
            slotId: 1,
            batteryId: 1,
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            slotId: 2,
            batteryId: 2,
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],

    payments: [
        {
            id: 1,
            name: 'Tiền mặt',
            description: 'Thanh toán bằng tiền mặt tại trạm',
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            name: 'Ví điện tử',
            description: 'Thanh toán qua ví điện tử',
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],

    transactions: [
        {
            id: 1,
            paymentId: 2,
            totalPrice: 50000,
            dateTime: new Date('2025-09-30T08:00:00'),
            status: TransactionStatus.SUCCESS,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            paymentId: 1,
            totalPrice: 75000,
            dateTime: new Date('2025-09-30T10:00:00'),
            status: TransactionStatus.SUCCESS,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 3,
            paymentId: 2,
            userMembershipId: 1,
            totalPrice: 150000,
            dateTime: new Date('2025-09-28T09:00:00'),
            status: TransactionStatus.SUCCESS,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 4,
            paymentId: 1,
            userMembershipId: 2,
            totalPrice: 350000,
            dateTime: new Date('2025-09-29T11:00:00'),
            status: TransactionStatus.SUCCESS,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],

    bookings: [
        {
            id: 1,
            userVehicleId: 1,
            userMembershipId: 1,
            transactionId: 1,
            stationId: 1,
            expectedPickupTime: new Date('2025-10-20T09:00:00'),
            status: BookingStatus.COMPLETED,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            userVehicleId: 2,
            userMembershipId: 2,
            transactionId: 2,
            stationId: 2,
            expectedPickupTime: new Date('2025-10-21T10:00:00'),
            status: BookingStatus.RESERVED,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],

    bookingDetails: [
        {
            id: 1,
            bookingId: 1,
            batteryId: 2,
            price: 50000,
            status: BookingDetailStatus.COMPLETED,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            bookingId: 2,
            batteryId: 3,
            price: 50000,
            status: BookingDetailStatus.RESERVED,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],

    batteryUsedHistories: [
        {
            id: 1,
            batteryId: 1,
            bookingId: 1,
            currentCapacity: 1800,
            currentCycle: 150,
            healthScore: 90,
            percent: 15,
            recentPrice: 50000,
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],

    feedbacks: [
        {
            id: 1,
            userId: 2,
            stationId: 1,
            content: 'Dịch vụ tốt, nhân viên thân thiện, đổi pin nhanh chóng',
            rating: 5,
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            userId: 3,
            stationId: 2,
            content: 'Trạm sạch sẽ, tuy nhiên thời gian chờ hơi lâu',
            rating: 4,
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ]
};
