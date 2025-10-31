import { ApiProperty } from '@nestjs/swagger';
import { NumberRequired, StringRequired } from 'src/common/decorators';

export class UpdateBookingTransactionDto {
    @StringRequired('Payment Code')
    code: string;

    @NumberRequired('Order Code')
    orderCode: number;

    @StringRequired('Payment Status')
    status: string;
}
