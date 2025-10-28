import { NumberRequired } from 'src/common/decorators';

export class CreateBookingTransactionDto {
    @NumberRequired('Payment ID')
    paymentId: number;

    @NumberRequired('Booking ID')
    bookingId: number;

    @NumberRequired('Total Price')
    totalPrice: number;
}