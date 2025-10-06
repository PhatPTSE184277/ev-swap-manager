import { PartialType } from "@nestjs/swagger";
import { CreateUserVehicleDto } from "./create-user-vehicle.dto";
import { BooleanNotRequired } from "src/common/decorators";

export class UpdateUserVehicleDto extends PartialType(CreateUserVehicleDto) {
}  