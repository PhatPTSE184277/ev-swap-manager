import { NumberRequired } from "src/common/decorators";

export class TakeBatteryDto {
    @NumberRequired('Slot ID')
    slotId: number;

    @NumberRequired('Booking ID')
    bookingId: number;
}