import { NumberNotRequired, NumberRequired } from "src/common/decorators";

export class CreateBookingDto {

    @NumberRequired("Phương tiện của người dùng")
    userVehicleId: number;

    @NumberNotRequired("Gói thành viên")
    userMembershipId?: number;

    
}