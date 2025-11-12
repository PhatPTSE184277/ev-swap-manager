import { IsEmail} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NumberRequired, StringRequired } from 'src/common/decorators';

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
}