import { NumberRequired, StringRequired } from "src/common/decorators";

export class CreateBatteryDto {
    @StringRequired('Tên pin')
    name?: string;

    @NumberRequired('Dung lượng')
    capacity: number;

    @NumberRequired('Chu kỳ sạc')
    cycleLife: number;

    @NumberRequired('Giá')
    price: number;
}