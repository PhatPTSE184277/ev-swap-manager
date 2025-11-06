import { NumberRequired, StringRequired } from "src/common/decorators";

export class CreateUserBatteryDto {
    @NumberRequired('Xe của người dùng')
    userVehicleId: number;

    @StringRequired('Model pin')
    model: string;

    @NumberRequired('Dung lượng pin hiện tại')
    currentCapacity?: number;

    @NumberRequired('Số chu kỳ hiện tại')
    currentCycle?: number;

    @NumberRequired('Điểm sức khỏe pin')
    healthScore?: number;
}