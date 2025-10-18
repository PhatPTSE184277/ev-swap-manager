import { NumberRequired } from "src/common/decorators";

export class CreateUserMembershipDto {
    @NumberRequired('Gói thành viên')
    membershipId: number;
}