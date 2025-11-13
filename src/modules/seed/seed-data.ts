import { RoleName } from '../../enums/role.enum';
import { UserStatus } from '../../enums/user.enum';
import { UserMembershipStatus } from '../../enums/membership.enum';
import { BatteryStatus } from '../../enums/battery.enum';
import { SlotStatus } from '../../enums/slot.enum';

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
            description: 'Gói VIP - 60 lần đổi pin/tháng',
            price: 20000,
            duration: 30,
            swapLimit: 60,
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
            name: 'Trạm Trung Tâm Quận 1',
            description:
                'Trạm chính phục vụ khu vực trung tâm thành phố, gần phố đi bộ Nguyễn Huệ.',
            address: '12 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
            image: 'https://www.global-imi.com/sites/default/files/shutterstock_2002470953-min%20(1)_1.jpg',
            latitude: 10.77653,
            longitude: 106.70098,
            openTime: '00:00:00',
            closeTime: '24:00:00',
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            name: 'Trạm Khu Công Nghệ Cao Quận 9',
            description:
                'Trạm phục vụ khu công nghệ cao và Đại học Quốc Gia TP.HCM.',
            address: 'Khu CNC, Phường Hiệp Phú, TP. Thủ Đức, TP. Hồ Chí Minh',
            image: 'https://autopro8.mediacdn.vn/134505113543774208/2025/9/3/z6964014376408dcf79f53beceae25a619d8ab453868eb-1756692183922500878105-1756741724623-1756741725069996502227-1756862554533-17568625550121794203181.jpg',
            latitude: 10.84555,
            longitude: 106.79482,
            openTime: '05:30:00',
            closeTime: '21:30:00',
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 3,
            name: 'Trạm Bến Xe Miền Đông',
            description:
                'Trạm đặt tại Bến xe Miền Đông mới, khu vực ngã tư Thủ Đức – trung tâm giao thông đi các tỉnh phía Bắc và Trung.',
            address:
                '501 Hoàng Hữu Nam, Phường Long Bình, TP. Thủ Đức, TP. Hồ Chí Minh',
            image: 'https://storage.googleapis.com/vinfast-data-01/tim-hieu-he-sinh-thai-tram-sac-xe-dien-vinfast-tren-toan-quoc-2_1624502818.jpg',
            latitude: 10.86978,
            longitude: 106.80043,
            openTime: '05:00:00',
            closeTime: '23:00:00',
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
            date: new Date(),
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            stationStaffId: 1,
            stationId: 1,
            date: new Date(),
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],

    cabinets: [
        {
            id: 1,
            name: 'Tủ A1 - Trạm Trung Tâm Quận 1',
            stationId: 1,
            batteryTypeId: 1,
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            name: 'Tủ A2 - Trạm Trung Tâm Quận 1',
            stationId: 1,
            batteryTypeId: 2,
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },

        {
            id: 3,
            name: 'Tủ B1 - Trạm Khu Công Nghệ Cao Quận 9',
            stationId: 2,
            batteryTypeId: 1,
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 4,
            name: 'Tủ B2 - Trạm Khu Công Nghệ Cao Quận 9',
            stationId: 2,
            batteryTypeId: 2,
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },

        {
            id: 5,
            name: 'Tủ C1 - Trạm Bến Xe Miền Đông',
            stationId: 3,
            batteryTypeId: 1,
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 6,
            name: 'Tủ C2 - Trạm Bến Xe Miền Đông',
            stationId: 3,
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
            pricePerSwap: 2000,
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
            pricePerSwap: 3000,
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
            vehicleTypeId: 2,
            name: 'Vinfast Evo 200 - Nguyễn Văn A',
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            userId: 3,
            vehicleTypeId: 1,
            name: 'Yadea G5 - Trần Thị B',
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 3,
            userId: 3,
            vehicleTypeId: 2,
            name: 'Yadea Extra 1000 - Trần Thị B',
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 4,
            userId: 2,
            vehicleTypeId: 1,
            name: 'Vìnast Eco Hyper 400 - Nguyễn Văn A',
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],

    batteries: [
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
            batteryTypeId: 2,
            model: 'BAT48V007',
            currentCycle: 80,
            currentCapacity: 98,
            healthScore: 96,
            lastChargeTime: new Date('2025-10-27T10:00:00'),
            estimatedFullChargeTime: new Date('2025-10-27T12:30:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
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
            status: BatteryStatus.MAINTENANCE,
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
            userVehicleId: 1,
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
        },

        {
            id: 31,
            batteryTypeId: 2,
            model: 'BAT60V013',
            currentCycle: 160,
            currentCapacity: 87,
            healthScore: 85,
            lastChargeTime: new Date('2025-10-27T08:20:00'),
            estimatedFullChargeTime: new Date('2025-10-27T11:20:00'),
            status: BatteryStatus.IN_USE,
            userVehicleId: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 32,
            batteryTypeId: 2,
            model: 'BAT60V014',
            currentCycle: 340,
            currentCapacity: 72,
            healthScore: 74,
            lastChargeTime: new Date('2025-10-27T06:45:00'),
            estimatedFullChargeTime: new Date('2025-10-27T09:45:00'),
            status: BatteryStatus.CHARGING,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 33,
            batteryTypeId: 2,
            model: 'BAT60V015',
            currentCycle: 75,
            currentCapacity: 99,
            healthScore: 96,
            lastChargeTime: new Date('2025-10-27T09:50:00'),
            estimatedFullChargeTime: new Date('2025-10-27T12:50:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 34,
            batteryTypeId: 2,
            model: 'BAT60V016',
            currentCycle: 520,
            currentCapacity: 62,
            healthScore: 64,
            lastChargeTime: new Date('2025-10-27T05:30:00'),
            estimatedFullChargeTime: new Date('2025-10-27T08:30:00'),
            status: BatteryStatus.MAINTENANCE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 35,
            batteryTypeId: 2,
            model: 'BAT60V017',
            currentCycle: 210,
            currentCapacity: 83,
            healthScore: 81,
            lastChargeTime: new Date('2025-10-27T07:15:00'),
            estimatedFullChargeTime: new Date('2025-10-27T10:15:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 36,
            batteryTypeId: 2,
            model: 'BAT60V018',
            currentCycle: 95,
            currentCapacity: 94,
            healthScore: 92,
            lastChargeTime: new Date('2025-10-27T10:05:00'),
            estimatedFullChargeTime: new Date('2025-10-27T13:05:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 37,
            batteryTypeId: 2,
            model: 'BAT60V019',
            currentCycle: 280,
            currentCapacity: 76,
            healthScore: 78,
            lastChargeTime: new Date('2025-10-27T06:20:00'),
            estimatedFullChargeTime: new Date('2025-10-27T09:20:00'),
            status: BatteryStatus.CHARGING,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 38,
            batteryTypeId: 2,
            model: 'BAT60V020',
            currentCycle: 145,
            currentCapacity: 89,
            healthScore: 88,
            lastChargeTime: new Date('2025-10-27T08:40:00'),
            estimatedFullChargeTime: new Date('2025-10-27T11:40:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 39,
            batteryTypeId: 1,
            model: 'BAT60V021',
            currentCycle: 65,
            currentCapacity: 100,
            healthScore: 97,
            lastChargeTime: new Date('2025-10-27T09:25:00'),
            estimatedFullChargeTime: new Date('2025-10-27T12:25:00'),
            status: BatteryStatus.IN_USE,
            userVehicleId: 2,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 40,
            batteryTypeId: 2,
            model: 'BAT60V022',
            currentCycle: 450,
            currentCapacity: 65,
            healthScore: 68,
            lastChargeTime: new Date('2025-10-26T23:00:00'),
            estimatedFullChargeTime: null,
            status: BatteryStatus.MAINTENANCE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 41,
            batteryTypeId: 1,
            model: 'BAT48V019',
            currentCycle: 110,
            currentCapacity: 91,
            healthScore: 90,
            lastChargeTime: new Date('2025-10-27T08:10:00'),
            estimatedFullChargeTime: new Date('2025-10-27T10:40:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 42,
            batteryTypeId: 1,
            model: 'BAT48V020',
            currentCycle: 320,
            currentCapacity: 74,
            healthScore: 76,
            lastChargeTime: new Date('2025-10-27T06:50:00'),
            estimatedFullChargeTime: new Date('2025-10-27T09:20:00'),
            status: BatteryStatus.CHARGING,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 43,
            batteryTypeId: 1,
            model: 'BAT48V021',
            currentCycle: 55,
            currentCapacity: 100,
            healthScore: 98,
            lastChargeTime: new Date('2025-10-27T09:35:00'),
            estimatedFullChargeTime: new Date('2025-10-27T12:05:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 44,
            batteryTypeId: 1,
            model: 'BAT48V022',
            currentCycle: 240,
            currentCapacity: 80,
            healthScore: 82,
            lastChargeTime: new Date('2025-10-27T07:40:00'),
            estimatedFullChargeTime: new Date('2025-10-27T10:10:00'),
            status: BatteryStatus.IN_USE,
            userVehicleId: 2,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 45,
            batteryTypeId: 1,
            model: 'BAT48V023',
            currentCycle: 180,
            currentCapacity: 86,
            healthScore: 85,
            lastChargeTime: new Date('2025-10-27T08:25:00'),
            estimatedFullChargeTime: new Date('2025-10-27T10:55:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 46,
            batteryTypeId: 1,
            model: 'BAT48V024',
            currentCycle: 88,
            currentCapacity: 97,
            healthScore: 95,
            lastChargeTime: new Date('2025-10-27T09:55:00'),
            estimatedFullChargeTime: new Date('2025-10-27T12:25:00'),
            status: BatteryStatus.IN_USE,
            userVehicleId: 4,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 47,
            batteryTypeId: 1,
            model: 'BAT48V025',
            currentCycle: 370,
            currentCapacity: 70,
            healthScore: 72,
            lastChargeTime: new Date('2025-10-27T05:45:00'),
            estimatedFullChargeTime: new Date('2025-10-27T08:15:00'),
            status: BatteryStatus.IN_USE,
            userVehicleId: 4,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 48,
            batteryTypeId: 1,
            model: 'BAT48V026',
            currentCycle: 135,
            currentCapacity: 88,
            healthScore: 87,
            lastChargeTime: new Date('2025-10-27T08:50:00'),
            estimatedFullChargeTime: new Date('2025-10-27T11:20:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 49,
            batteryTypeId: 1,
            model: 'BAT48V027',
            currentCycle: 580,
            currentCapacity: 58,
            healthScore: 60,
            lastChargeTime: new Date('2025-10-26T21:00:00'),
            estimatedFullChargeTime: null,
            status: BatteryStatus.MAINTENANCE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 50,
            batteryTypeId: 1,
            model: 'BAT48V028',
            currentCycle: 195,
            currentCapacity: 84,
            healthScore: 83,
            lastChargeTime: new Date('2025-10-27T07:55:00'),
            estimatedFullChargeTime: new Date('2025-10-27T10:25:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 51,
            batteryTypeId: 1,
            model: 'BAT48V029',
            currentCycle: 270,
            currentCapacity: 77,
            healthScore: 79,
            lastChargeTime: new Date('2025-10-27T06:35:00'),
            estimatedFullChargeTime: new Date('2025-10-27T09:05:00'),
            status: BatteryStatus.CHARGING,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 52,
            batteryTypeId: 1,
            model: 'BAT48V030',
            currentCycle: 105,
            currentCapacity: 93,
            healthScore: 91,
            lastChargeTime: new Date('2025-10-27T09:20:00'),
            estimatedFullChargeTime: new Date('2025-10-27T11:50:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },

        // Batteries cho Cabinet 6 (batteryTypeId: 2, stationId: 3) - 12 batteries
        {
            id: 53,
            batteryTypeId: 2,
            model: 'BAT60V023',
            currentCycle: 125,
            currentCapacity: 90,
            healthScore: 89,
            lastChargeTime: new Date('2025-10-27T08:30:00'),
            estimatedFullChargeTime: new Date('2025-10-27T11:30:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 54,
            batteryTypeId: 2,
            model: 'BAT60V024',
            currentCycle: 410,
            currentCapacity: 67,
            healthScore: 69,
            lastChargeTime: new Date('2025-10-27T05:15:00'),
            estimatedFullChargeTime: new Date('2025-10-27T08:15:00'),
            status: BatteryStatus.MAINTENANCE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 55,
            batteryTypeId: 1,
            model: 'BAT60V025',
            currentCycle: 68,
            currentCapacity: 99,
            healthScore: 97,
            lastChargeTime: new Date('2025-10-27T10:10:00'),
            estimatedFullChargeTime: new Date('2025-10-27T13:10:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 56,
            batteryTypeId: 2,
            model: 'BAT60V026',
            currentCycle: 305,
            currentCapacity: 73,
            healthScore: 75,
            lastChargeTime: new Date('2025-10-27T06:55:00'),
            estimatedFullChargeTime: new Date('2025-10-27T09:55:00'),
            status: BatteryStatus.CHARGING,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 57,
            batteryTypeId: 2,
            model: 'BAT60V027',
            currentCycle: 155,
            currentCapacity: 87,
            healthScore: 86,
            lastChargeTime: new Date('2025-10-27T08:15:00'),
            estimatedFullChargeTime: new Date('2025-10-27T11:15:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 58,
            batteryTypeId: 2,
            model: 'BAT60V028',
            currentCycle: 92,
            currentCapacity: 96,
            healthScore: 94,
            lastChargeTime: new Date('2025-10-27T09:40:00'),
            estimatedFullChargeTime: new Date('2025-10-27T12:40:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 59,
            batteryTypeId: 2,
            model: 'BAT60V029',
            currentCycle: 480,
            currentCapacity: 64,
            healthScore: 66,
            lastChargeTime: new Date('2025-10-26T23:30:00'),
            estimatedFullChargeTime: null,
            status: BatteryStatus.MAINTENANCE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 60,
            batteryTypeId: 2,
            model: 'BAT60V030',
            currentCycle: 215,
            currentCapacity: 81,
            healthScore: 80,
            lastChargeTime: new Date('2025-10-27T07:25:00'),
            estimatedFullChargeTime: new Date('2025-10-27T10:25:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 61,
            batteryTypeId: 2,
            model: 'BAT60V031',
            currentCycle: 175,
            currentCapacity: 85,
            healthScore: 84,
            lastChargeTime: new Date('2025-10-27T08:05:00'),
            estimatedFullChargeTime: new Date('2025-10-27T11:05:00'),
            status: BatteryStatus.CHARGING,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 62,
            batteryTypeId: 2,
            model: 'BAT60V032',
            currentCycle: 98,
            currentCapacity: 95,
            healthScore: 93,
            lastChargeTime: new Date('2025-10-27T09:45:00'),
            estimatedFullChargeTime: new Date('2025-10-27T12:45:00'),
            status: BatteryStatus.IN_USE,
            userVehicleId: 3,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 63,
            batteryTypeId: 2,
            model: 'BAT60V033',
            currentCycle: 350,
            currentCapacity: 71,
            healthScore: 73,
            lastChargeTime: new Date('2025-10-27T06:10:00'),
            estimatedFullChargeTime: new Date('2025-10-27T09:10:00'),
            status: BatteryStatus.IN_USE,
            userVehicleId: 3,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 64,
            batteryTypeId: 2,
            model: 'BAT60V034',
            currentCycle: 140,
            currentCapacity: 89,
            healthScore: 88,
            lastChargeTime: new Date('2025-10-27T08:35:00'),
            estimatedFullChargeTime: new Date('2025-10-27T11:35:00'),
            status: BatteryStatus.AVAILABLE,
            userVehicleId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],

    slots: [
        // Cabinet 1 (batteryTypeId: 1) - 12 slots
        {
            id: 1,
            cabinetId: 1,
            name: 'Slot 1-1',
            batteryId: 1,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            cabinetId: 1,
            name: 'Slot 1-2',
            batteryId: 2,
            status: SlotStatus.CHARGING,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 3,
            cabinetId: 1,
            name: 'Slot 1-3',
            batteryId: 3,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 4,
            cabinetId: 1,
            name: 'Slot 1-4',
            batteryId: 4,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 5,
            cabinetId: 1,
            name: 'Slot 1-5',
            batteryId: 5,
            status: SlotStatus.CHARGING,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 6,
            cabinetId: 1,
            name: 'Slot 1-6',
            batteryId: 6,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 7,
            cabinetId: 1,
            name: 'Slot 1-7',
            batteryId: 7,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 8,
            cabinetId: 1,
            name: 'Slot 1-8',
            batteryId: 8,
            status: SlotStatus.MAINTENANCE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 9,
            cabinetId: 1,
            name: 'Slot 1-9',
            batteryId: 9,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 10,
            cabinetId: 1,
            name: 'Slot 1-10',
            batteryId: 10,
            status: SlotStatus.CHARGING,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 11,
            cabinetId: 1,
            name: 'Slot 1-11',
            batteryId: null,
            status: SlotStatus.EMPTY,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 12,
            cabinetId: 1,
            name: 'Slot 1-12',
            batteryId: null,
            status: SlotStatus.EMPTY,
            createdAt: new Date(),
            updatedAt: new Date()
        },

        // Cabinet 2 (batteryTypeId: 2) - 12 slots
        {
            id: 13,
            cabinetId: 2,
            name: 'Slot 2-1',
            batteryId: 19,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 14,
            cabinetId: 2,
            name: 'Slot 2-2',
            batteryId: 20,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 15,
            cabinetId: 2,
            name: 'Slot 2-3',
            batteryId: 21,
            status: SlotStatus.CHARGING,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 16,
            cabinetId: 2,
            name: 'Slot 2-4',
            batteryId: 22,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 17,
            cabinetId: 2,
            name: 'Slot 2-5',
            batteryId: null,
            status: SlotStatus.EMPTY,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 18,
            cabinetId: 2,
            name: 'Slot 2-6',
            batteryId: 24,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 19,
            cabinetId: 2,
            name: 'Slot 2-7',
            batteryId: 25,
            status: SlotStatus.CHARGING,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 20,
            cabinetId: 2,
            name: 'Slot 2-8',
            batteryId: 26,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 21,
            cabinetId: 2,
            name: 'Slot 2-9',
            batteryId: 27,
            status: SlotStatus.MAINTENANCE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 22,
            cabinetId: 2,
            name: 'Slot 2-10',
            batteryId: 28,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 23,
            cabinetId: 2,
            name: 'Slot 2-11',
            batteryId: 29,
            status: SlotStatus.CHARGING,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 24,
            cabinetId: 2,
            name: 'Slot 2-12',
            batteryId: 30,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },

        // Cabinet 3 (batteryTypeId: 1) - 12 slots
        {
            id: 25,
            cabinetId: 3,
            name: 'Slot 3-1',
            batteryId: 11,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 26,
            cabinetId: 3,
            name: 'Slot 3-2',
            batteryId: 12,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 27,
            cabinetId: 3,
            name: 'Slot 3-3',
            batteryId: 13,
            status: SlotStatus.CHARGING,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 28,
            cabinetId: 3,
            name: 'Slot 3-4',
            batteryId: 14,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 29,
            cabinetId: 3,
            name: 'Slot 3-5',
            batteryId: 15,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 30,
            cabinetId: 3,
            name: 'Slot 3-6',
            batteryId: 16,
            status: SlotStatus.MAINTENANCE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 31,
            cabinetId: 3,
            name: 'Slot 3-7',
            batteryId: 17,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 32,
            cabinetId: 3,
            name: 'Slot 3-8',
            batteryId: 18,
            status: SlotStatus.CHARGING,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 33,
            cabinetId: 3,
            name: 'Slot 3-9',
            batteryId: null,
            status: SlotStatus.EMPTY,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 34,
            cabinetId: 3,
            name: 'Slot 3-10',
            batteryId: null,
            status: SlotStatus.EMPTY,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 35,
            cabinetId: 3,
            name: 'Slot 3-11',
            batteryId: null,
            status: SlotStatus.EMPTY,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 36,
            cabinetId: 3,
            name: 'Slot 3-12',
            batteryId: null,
            status: SlotStatus.EMPTY,
            createdAt: new Date(),
            updatedAt: new Date()
        },

        // Cabinet 4 (batteryTypeId: 2) - 12 slots
        {
            id: 37,
            cabinetId: 4,
            name: 'Slot 4-1',
            batteryId: null,
            status: SlotStatus.EMPTY,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 38,
            cabinetId: 4,
            name: 'Slot 4-2',
            batteryId: 32,
            status: SlotStatus.CHARGING,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 39,
            cabinetId: 4,
            name: 'Slot 4-3',
            batteryId: 33,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 40,
            cabinetId: 4,
            name: 'Slot 4-4',
            batteryId: 34,
            status: SlotStatus.MAINTENANCE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 41,
            cabinetId: 4,
            name: 'Slot 4-5',
            batteryId: 35,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 42,
            cabinetId: 4,
            name: 'Slot 4-6',
            batteryId: 36,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 43,
            cabinetId: 4,
            name: 'Slot 4-7',
            batteryId: 37,
            status: SlotStatus.CHARGING,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 44,
            cabinetId: 4,
            name: 'Slot 4-8',
            batteryId: 38,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 45,
            cabinetId: 4,
            name: 'Slot 4-9',
            batteryId: null,
            status: SlotStatus.EMPTY,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 46,
            cabinetId: 4,
            name: 'Slot 4-10',
            batteryId: 40,
            status: SlotStatus.MAINTENANCE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 47,
            cabinetId: 4,
            name: 'Slot 4-11',
            batteryId: null,
            status: SlotStatus.EMPTY,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 48,
            cabinetId: 4,
            name: 'Slot 4-12',
            batteryId: null,
            status: SlotStatus.EMPTY,
            createdAt: new Date(),
            updatedAt: new Date()
        },

        // Cabinet 5 (batteryTypeId: 1) - 12 slots
        {
            id: 49,
            cabinetId: 5,
            name: 'Slot 5-1',
            batteryId: 41,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 50,
            cabinetId: 5,
            name: 'Slot 5-2',
            batteryId: 42,
            status: SlotStatus.CHARGING,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 51,
            cabinetId: 5,
            name: 'Slot 5-3',
            batteryId: 43,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 52,
            cabinetId: 5,
            name: 'Slot 5-4',
            batteryId: null,
            status: SlotStatus.EMPTY,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 53,
            cabinetId: 5,
            name: 'Slot 5-5',
            batteryId: 45,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 54,
            cabinetId: 5,
            name: 'Slot 5-6',
            batteryId: null,
            status: SlotStatus.EMPTY,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 55,
            cabinetId: 5,
            name: 'Slot 5-7',
            batteryId: null,
            status: SlotStatus.EMPTY,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 56,
            cabinetId: 5,
            name: 'Slot 5-8',
            batteryId: 48,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 57,
            cabinetId: 5,
            name: 'Slot 5-9',
            batteryId: 49,
            status: SlotStatus.MAINTENANCE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 58,
            cabinetId: 5,
            name: 'Slot 5-10',
            batteryId: 50,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 59,
            cabinetId: 5,
            name: 'Slot 5-11',
            batteryId: 51,
            status: SlotStatus.CHARGING,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 60,
            cabinetId: 5,
            name: 'Slot 5-12',
            batteryId: 52,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },

        // Cabinet 6 (batteryTypeId: 2) - 12 slots
        {
            id: 61,
            cabinetId: 6,
            name: 'Slot 6-1',
            batteryId: 53,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 62,
            cabinetId: 6,
            name: 'Slot 6-2',
            batteryId: 54,
            status: SlotStatus.MAINTENANCE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 63,
            cabinetId: 6,
            name: 'Slot 6-3',
            batteryId: 55,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 64,
            cabinetId: 6,
            name: 'Slot 6-4',
            batteryId: 56,
            status: SlotStatus.CHARGING,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 65,
            cabinetId: 6,
            name: 'Slot 6-5',
            batteryId: 57,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 66,
            cabinetId: 6,
            name: 'Slot 6-6',
            batteryId: 58,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 67,
            cabinetId: 6,
            name: 'Slot 6-7',
            batteryId: 59,
            status: SlotStatus.MAINTENANCE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 68,
            cabinetId: 6,
            name: 'Slot 6-8',
            batteryId: 60,
            status: SlotStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 69,
            cabinetId: 6,
            name: 'Slot 6-9',
            batteryId: 61,
            status: SlotStatus.CHARGING,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 70,
            cabinetId: 6,
            name: 'Slot 6-10',
            batteryId: null,
            status: SlotStatus.EMPTY,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 71,
            cabinetId: 6,
            name: 'Slot 6-11',
            batteryId: null,
            status: SlotStatus.EMPTY,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 72,
            cabinetId: 6,
            name: 'Slot 6-12',
            batteryId: 64,
            status: SlotStatus.AVAILABLE,
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
