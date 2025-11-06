import { NumberRequired } from "src/common/decorators";

export class CreateSessionDto {
    @NumberRequired('Trạm đổi pin')
    stationId: number;
}
