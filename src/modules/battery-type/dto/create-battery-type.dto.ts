import { NumberRequired, StringNotRequired, StringRequired } from "src/common/decorators";

export class CreateBatteryTypeDto {
    @StringRequired('Tên loại pin')
    name: string;

    @StringNotRequired('Mô tả loại pin')
    description?: string;

    @NumberRequired('Dung lượng pin (kWh)')
    capacityKWh: number;

    @NumberRequired('Số chu kỳ sạc tối đa trước khi chai')
    cycleLife: number;

    @NumberRequired('Thời gian sạc đầy (giờ)')
    chargeRate: number;

    @NumberRequired('Giá mỗi lần hoán đổi pin (VNĐ)')
    pricePerSwap: number;
}