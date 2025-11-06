import { NumberRequired, StringRequired } from 'src/common/decorators';

export class CreateCabinetDto {
    @StringRequired('Tên tủ')
    name: string;

    @NumberRequired('Trạm')
    stationId: number;

    @NumberRequired('Số lượng slot')
    slotCount: number;

    @NumberRequired('Loại pin')
    batteryTypeId: number;
}