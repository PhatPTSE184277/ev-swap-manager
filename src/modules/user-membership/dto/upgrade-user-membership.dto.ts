import { NumberRequired } from "src/common/decorators";

export class UpgradeUserMembershipDto {
    @NumberRequired('Gói thành viên mới')
    newMembershipId: number;

    @NumberRequired('Phương thức thanh toán')
    paymentId: number;
}