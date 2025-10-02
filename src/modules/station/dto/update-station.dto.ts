import { PartialType } from "@nestjs/swagger";
import { CreateStationDto } from "./create-station.dto";
import { BooleanNotRequired } from "src/common/decorators";

export class UpdateStationDto extends PartialType(CreateStationDto) {
    @BooleanNotRequired('Trạng thái')
    status?: boolean;
}