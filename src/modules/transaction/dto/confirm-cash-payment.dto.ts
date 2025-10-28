import { NumberRequired } from 'src/common/decorators';

export class ConfirmCashPaymentDto {
    @NumberRequired('Transaction ID')
    transactionId: number;
}