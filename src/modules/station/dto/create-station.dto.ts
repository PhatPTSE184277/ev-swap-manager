import { StringRequired, NumberRequired, BooleanNotRequired } from 'src/common/decorators';

export class CreateStationDto {
    @StringRequired('Tên trạm', 1, 100)
    name: string;

    @StringRequired('Mô tả', 1, 255)
    description: string;

    @StringRequired('Địa chỉ', 1, 255)
    address: string;

    @NumberRequired('Vĩ độ')
    latitude: number;

    @NumberRequired('Kinh độ')
    longitude: number;

    @NumberRequired('Nhiệt độ')
    temperature: number;
}