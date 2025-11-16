import {
    ArrayNotEmpty,
    IsArray,
    IsNumber,
    IsOptional,
    IsString
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StringNotRequired } from 'src/common/decorators';

export class AcceptRequestDto {
    @ApiProperty({
        description: 'Danh sách id pin được cấp',
        type: [Number]
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({}, { each: true })
    batteryIds: number[];

    @StringNotRequired('Ghi chú')
    note?: string;
}
