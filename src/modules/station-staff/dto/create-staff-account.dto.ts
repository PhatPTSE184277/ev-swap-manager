import { IsEmail, IsOptional, ValidateNested, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BooleanNotRequired, NumberRequired, StringRequired } from 'src/common/decorators';
import { Type } from 'class-transformer';
import { StaffHistoryShift } from 'src/enums/station.enum';

export class CreateStaffAccountDto {
    @StringRequired('Username')
    username: string;

    @ApiProperty({ description: 'Email của nhân viên' })
    @IsEmail({}, { message: 'Email không hợp lệ' })
    email: string;

    @StringRequired('Họ tên')
    fullName: string;

    @NumberRequired('ID trạm')
    stationId: number;

    @BooleanNotRequired('Có phải trưởng trạm không')
    isHead?: boolean = false;

    @ApiProperty({ enum: StaffHistoryShift, required: false })
    @IsOptional()
    @IsEnum(StaffHistoryShift)
    shift?: StaffHistoryShift;
}