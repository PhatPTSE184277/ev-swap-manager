import { RoleName } from '../../enums/role.enum';
import { UserStatus } from '../../enums/user.enum';
import { UserMembershipStatus } from '../../enums/membership.enum';
import { StaffHistoryShift } from '../../enums/station.enum';
import { BatteryStatus, BatteryUsedStatus } from '../../enums/battery.enum';
import { SlotStatus, SlotHistoryStatus } from '../../enums/slot.enum';
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
            price: 150000,
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
            price: 350000,
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
            price: 500000,
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
            expiredDate: new Date('2024-10-01'),
            status: UserMembershipStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            userId: 3,
            membershipId: 2,
            expiredDate: new Date('2024-10-15'),
            status: UserMembershipStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date()
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
            temperature: 25.5,
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            name: 'Tủ 2',
            stationId: 1,
            temperature: 26.0,
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 3,
            name: 'Tủ 1',
            stationId: 2,
            temperature: 27.5,
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
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            name: 'Li-ion 60V Premium',
            description: 'Pin lithium-ion 60V cao cấp cho xe máy điện',
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

    batteries: [
        {
            id: 1,
            batteryTypeId: 1,
            model: 'BAT48V001',
            capacity: 2000,
            cycleLife: 1000,
            price: 2500000,
            status: BatteryStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            batteryTypeId: 1,
            model: 'BAT48V002',
            capacity: 2000,
            cycleLife: 1000,
            price: 2500000,
            status: BatteryStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 3,
            batteryTypeId: 2,
            model: 'BAT60V001',
            capacity: 3000,
            cycleLife: 1200,
            price: 3500000,
            status: BatteryStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 4,
            batteryTypeId: 2,
            model: 'BAT60V002',
            capacity: 3000,
            cycleLife: 1200,
            price: 3500000,
            status: BatteryStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 5,
            batteryTypeId: 1,
            model: 'BAT48V003',
            capacity: 2000,
            cycleLife: 1000,
            price: 2500000,
            status: BatteryStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],

    slots: [
        {
            id: 1,
            cabinetId: 1,
            batteryId: 1,
            status: SlotStatus.FULL,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            cabinetId: 1,
            batteryId: 2,
            status: SlotStatus.CHARGING,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 3,
            cabinetId: 1,
            batteryId: 5,
            status: SlotStatus.EMPTY,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 4,
            cabinetId: 2,
            batteryId: 3,
            status: SlotStatus.OCCUPIED,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 5,
            cabinetId: 2,
            batteryId: 4,
            status: SlotStatus.MAINTENANCE,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],

    slotHistories: [
        {
            id: 1,
            slotId: 1,
            batteryId: 1,
            date: new Date('2025-09-30T08:00:00'),
            status: SlotHistoryStatus.FULL,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            slotId: 2,
            batteryId: 2,
            date: new Date('2025-09-30T09:00:00'),
            status: SlotHistoryStatus.CHARGING,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 3,
            slotId: 3,
            batteryId: 5,
            date: new Date('2025-09-30T10:00:00'),
            status: SlotHistoryStatus.EMPTY,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 4,
            slotId: 4,
            batteryId: 3,
            date: new Date('2025-09-30T11:00:00'),
            status: SlotHistoryStatus.OCCUPIED,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 5,
            slotId: 5,
            batteryId: 4,
            date: new Date('2025-09-30T12:00:00'),
            status: SlotHistoryStatus.MAINTENANCE,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],

    userVehicles: [
        {
            id: 1,
            userId: 2,
            vehicleTypeId: 1,
            batteryId: 1,
            name: 'Vinfast Evo 200 - Nguyễn Văn A',
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            userId: 3,
            vehicleTypeId: 2,
            batteryId: 3,
            name: 'Yadea G5 - Trần Thị B',
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
        },
       
    ],

    transactions: [
        {
            id: 1,
            paymentId: 2,
            totalPrice: 50000,
            dateTime: new Date('2025-09-30T08:00:00'),
            status: TransactionStatus.COMPLETED,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            paymentId: 1,
            totalPrice: 75000,
            dateTime: new Date('2025-09-30T10:00:00'),
            status: TransactionStatus.COMPLETED,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 3,
            paymentId: 2,
            userMembershipId: 1,
            totalPrice: 150000,
            dateTime: new Date('2025-09-28T09:00:00'),
            status: TransactionStatus.COMPLETED,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 4,
            paymentId: 1,
            userMembershipId: 2,
            totalPrice: 350000,
            dateTime: new Date('2025-09-29T11:00:00'),
            status: TransactionStatus.COMPLETED,
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
            batteryId: 2,
            status: BookingStatus.COMPLETED,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            userVehicleId: 2,
            userMembershipId: 2,
            transactionId: 2,
            batteryId: 3,
            status: BookingStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],

    bookingDetails: [
        {
            id: 1,
            bookingId: 1,
            oldBatteryPercent: 15,
            oldBatterySlotId: 1,
            quantityBattery: 1,
            totalPrice: 50000,
            status: BookingDetailStatus.COMPLETED,
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
            status: BatteryUsedStatus.COMPLETED,
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
