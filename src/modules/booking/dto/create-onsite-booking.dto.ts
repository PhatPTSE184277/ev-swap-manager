import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
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

    @IsOptional()
    @ApiProperty({
        description: 'ID phương thức thanh toán (bắt buộc nếu không có membership)',
        example: 1,
        required: false
    })
    paymentId?: number;

    @ApiProperty({
        type: [CreateOnsiteBookingDetailDto],
        description: 'Danh sách pin muốn đổi',
        example: [{ batteryId: 1 }]
    })
    @ValidateNested({ each: true })
    @Type(() => CreateOnsiteBookingDetailDto)
    bookingDetails: CreateOnsiteBookingDetailDto[];
}