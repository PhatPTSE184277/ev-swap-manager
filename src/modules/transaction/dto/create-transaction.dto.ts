import { NumberRequired } from "src/common/decorators";

export class CreateTransactionDto {
    @NumberRequired('Phương thức thanh toán')
    paymentId: number;

    @NumberRequired('Gói thành viên người dùng')
    userMembershipId?: number;

    @NumberRequired('Tổng giá tiền')
    totalPrice: number;
}