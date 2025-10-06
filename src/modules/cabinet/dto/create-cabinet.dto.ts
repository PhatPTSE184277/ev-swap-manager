import { NumberRequired, StringRequired } from 'src/common/decorators';

export class CreateCabinetDto {
    @StringRequired('Tên tủ')
    name: string;

    @NumberRequired('Trạm')
    stationId: number;

    @NumberRequired('Nhiệt độ')
    temperature: number;
}