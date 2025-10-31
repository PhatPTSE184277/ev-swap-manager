import { ApiProperty } from '@nestjs/swagger';
import { StringRequired } from 'src/common/decorators';

export class UpdateMembershipTransactionDto {
    @StringRequired('Payment Code')
    code: string;

    @StringRequired('Order Code')
    orderCode: number;

    @StringRequired('Payment Status')
    status: string;
}
