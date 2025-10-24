import { IsNumber, IsBoolean, IsOptional, ValidateNested, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BooleanNotRequired, NumberRequired } from 'src/common/decorators';
import { Type } from 'class-transformer';
import { StaffHistoryShift } from 'src/enums/station.enum';

export class CreateStationStaffHistoryDto {
    @ApiProperty({ enum: StaffHistoryShift, example: StaffHistoryShift.MORNING })
    @IsEnum(StaffHistoryShift)
    shift: StaffHistoryShift;
}

export class CreateStationStaffDto {
    @NumberRequired('ID người dùng là bắt buộc')
    userId: number;

    @NumberRequired('ID trạm là bắt buộc')
    stationId: number;

    @BooleanNotRequired('Có phải là trưởng trạm không')
    isHead?: boolean = false;

    @ApiProperty({ type: CreateStationStaffHistoryDto, required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => CreateStationStaffHistoryDto)
    history?: CreateStationStaffHistoryDto;
}