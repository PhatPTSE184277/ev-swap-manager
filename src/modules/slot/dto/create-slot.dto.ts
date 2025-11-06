import { NumberRequired, EnumRequired, StringRequired } from 'src/common/decorators';
import { SlotStatus } from 'src/enums';

export class CreateSlotDto {
    @NumberRequired('ID tủ')
    cabinetId: number;

    @NumberRequired('ID pin')
    batteryId: number;

    @StringRequired('Mã slot', 1, 50)
    name: string;

    @EnumRequired('Trạng thái slot', SlotStatus)
    status: SlotStatus;
}