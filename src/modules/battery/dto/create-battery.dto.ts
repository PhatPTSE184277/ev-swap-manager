import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import {
    NumberRequired,
    StringNotRequired,
    StringRequired
} from 'src/common/decorators';
import { BatteryStatus } from 'src/enums/battery.enum';

export class CreateBatteryDto {
    @NumberRequired('Loại pin')
    batteryTypeId: number;

    @StringRequired('Tên pin')
    model: string;

    @ApiProperty({
        enum: BatteryStatus,
        required: false,
        description: 'Trạng thái pin'
    })
    @IsEnum(BatteryStatus, { message: 'Trạng thái pin không hợp lệ' })
    @IsOptional()
    status?: BatteryStatus;
}
