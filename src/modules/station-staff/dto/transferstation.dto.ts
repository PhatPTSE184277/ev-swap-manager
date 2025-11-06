import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { NumberRequired } from 'src/common/decorators';
import { StaffHistoryShift } from 'src/enums/station.enum';

export class TransferStationDto {
    @NumberRequired('staffId')
    staffId: number;

    @NumberRequired('Trạm mới')
    newStationId: number;

    @ApiProperty({ 
        description: 'Ca làm việc ở trạm mới',
        enum: StaffHistoryShift,
        required: false,
        default: StaffHistoryShift.MORNING
    })
    @IsOptional()
    @IsEnum(StaffHistoryShift)
    shift?: StaffHistoryShift;
}