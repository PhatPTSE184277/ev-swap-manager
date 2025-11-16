import { NumberRequired } from "src/common/decorators";

export class CreateRequestDto {
    @NumberRequired('Loại pin')
    batteryTypeId: number;

    @NumberRequired('Số lượng')
    quantity: number;

    @NumberRequired('Trạm')
    stationId: number;
}