import { NumberNotRequired, NumberRequired } from "src/common/decorators";

export class CreateBookingDto {
    @NumberRequired("Phương tiện của người dùng")
    userVehicleId: number;

    @NumberRequired("Trạm đổi pin")
    stationId: number;

    @NumberRequired("Pin mới")
    batteryId: number;

    @NumberRequired("Slot lấy pin mới")
    newBatterySlotId: number;

    @NumberRequired("Slot bỏ pin cũ")
    oldBatterySlotId: number;

    @NumberRequired("Phần trăm pin cũ")
    oldBatteryPercent: number;

    @NumberNotRequired("ID phương thức thanh toán (nếu trả phí lẻ)")
    paymentId?: number;
}