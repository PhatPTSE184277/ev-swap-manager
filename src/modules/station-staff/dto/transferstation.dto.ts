import { NumberRequired } from 'src/common/decorators';

export class TransferStationDto {
    @NumberRequired('staffId')
    staffId: number;

    @NumberRequired('Trạm mới')
    newStationId: number;
}