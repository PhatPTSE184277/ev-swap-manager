import { PartialType } from "@nestjs/swagger";
import { CreateVehicleTypeDto } from "./create-vehicle-type.dto";
import { BooleanNotRequired } from "src/common/decorators";

export class UpdateVehicleTypeDto extends PartialType(CreateVehicleTypeDto) {
    @BooleanNotRequired('Trạng thái hoạt động')
    status?: boolean;
}