import { NumberRequired } from "src/common/decorators";

export class PutBatteryDto {
    @NumberRequired('Slot ID')
    slotId: number;

    @NumberRequired('Battery ID')
    batteryId: number;

    @NumberRequired('Booking ID')
    bookingId: number;
}