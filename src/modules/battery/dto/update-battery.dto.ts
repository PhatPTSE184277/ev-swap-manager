import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateBatteryDto } from './create-battery.dto';
import { BatteryStatus } from '../../../enums';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateBatteryDto extends PartialType(CreateBatteryDto) {
    @ApiPropertyOptional({ enum: BatteryStatus, description: 'Trạng thái pin' })
    @IsEnum(BatteryStatus, { message: 'Trạng thái pin không hợp lệ' })
    @IsOptional()
    status?: BatteryStatus;
}
