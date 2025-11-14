import { NumberRequired } from 'src/common/decorators';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class TransferStationDto {
    @NumberRequired('User ID')
    userId: number;

    @NumberRequired('Trạm mới')
    newStationId: number;

    @ApiProperty({ 
        description: 'Ngày bắt đầu chuyển trạm (YYYY-MM-DD)', 
        example: '2025-11-16',
        required: false 
    })
    @IsOptional()
    @IsDateString()
    date?: string;
}