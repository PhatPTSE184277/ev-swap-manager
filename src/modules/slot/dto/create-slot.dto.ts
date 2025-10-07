import { NumberRequired, EnumRequired } from 'src/common/decorators';
import { SlotStatus } from 'src/enums';

export class CreateSlotDto {
    @NumberRequired('ID tủ')
    cabinetId: number;

    @NumberRequired('ID pin')
    batteryId: number;

    @EnumRequired('Trạng thái slot', SlotStatus)
    status: SlotStatus;
}