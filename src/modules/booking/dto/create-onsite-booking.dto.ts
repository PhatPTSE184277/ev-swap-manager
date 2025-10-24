import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { NumberRequired } from 'src/common/decorators';

export class CreateOnsiteBookingDetailDto {
    @NumberRequired('Pin mới')
    batteryId: number;
}

export class CreateOnsiteBookingDto {
    @NumberRequired('Phương tiện của người dùng')
    userVehicleId: number;

    @NumberRequired('Trạm đổi pin')
    stationId: number;

    @ApiProperty({
        type: [CreateOnsiteBookingDetailDto],
        description: 'Danh sách pin muốn đổi',
        example: [{ batteryId: 0 }]
    })
    @ValidateNested({ each: true })
    @Type(() => CreateOnsiteBookingDetailDto)
    bookingDetails: CreateOnsiteBookingDetailDto[];
}