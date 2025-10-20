import { ApiProperty } from '@nestjs/swagger';
import { NumberNotRequired, NumberRequired } from 'src/common/decorators';

export class CreateBookingDetailDto {
    @NumberRequired('Pin mới')
    batteryId: number;
}

export class CreateBookingDto {
    @NumberRequired('Phương tiện của người dùng')
    userVehicleId: number;

    @NumberRequired('Trạm đổi pin')
    stationId: number;

    @NumberRequired('Vĩ độ người dùng')
    userLat: number;

    @NumberRequired('Kinh độ người dùng')
    userLng: number;

    @ApiProperty({
        type: [CreateBookingDetailDto],
        description: 'Danh sách pin muốn đổi',
        example: [{ batteryId: 0 }]
    })
    bookingDetails: CreateBookingDetailDto[];
}
