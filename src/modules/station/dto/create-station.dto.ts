import { StringRequired, NumberRequired, BooleanNotRequired } from 'src/common/decorators';

export class CreateStationDto {
    @StringRequired('Tên trạm', 1, 100)
    name: string;

    @StringRequired('Mô tả', 1, 255)
    description: string;

    @StringRequired('Địa chỉ', 1, 255)
    address: string;

    @StringRequired('Ảnh đại diện', 1, 255)
    image: string;

    @StringRequired('Thời gian mở cửa')
    openTime: string;

    @StringRequired('Thời gian đóng cửa')
    closeTime: string;

    @NumberRequired('Vĩ độ')
    latitude: number;

    @NumberRequired('Kinh độ')
    longitude: number;

    @NumberRequired('Nhiệt độ')
    temperature: number;
}