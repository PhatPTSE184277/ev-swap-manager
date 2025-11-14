import { NumberRequired } from "src/common/decorators";

export class CreateRequestDto {
    @NumberRequired('Pin')
    batteryId: number;

    @NumberRequired('Trạm mới')
    newStationId: number;
}