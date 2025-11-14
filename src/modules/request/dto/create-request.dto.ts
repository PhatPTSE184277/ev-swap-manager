import { NumberRequired } from "src/common/decorators";

export class CreateRequestDto {
    @NumberRequired('Pin')
    batteryId: number;

    @NumberRequired('Trạm hiện tại')
    currentStationId: number;

    @NumberRequired('Trạm mới')
    newStationId: number;
}