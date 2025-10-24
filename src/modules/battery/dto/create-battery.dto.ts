import { NumberRequired, StringRequired } from 'src/common/decorators';

export class CreateBatteryDto {
    @NumberRequired('Loại pin')
    batteryTypeId: number;

    @StringRequired('Tên pin')
    model: string;

    @NumberRequired('Chu kỳ hiện tại')
    currentCycle: number;

    @NumberRequired('Dung lượng hiện tại (kWh)')
    currentCapacity: number;

    @NumberRequired('Điểm sức khỏe pin')
    healthScore: number;

    @NumberRequired('Thời gian sạc đầy (giờ)')
    lastChargeTime: Date;

    @NumberRequired('Thời gian dự kiến sạc xong (giờ)')
    estimatedFullChargeTime: Date;

    @NumberRequired('Giá')
    price: number;
}
