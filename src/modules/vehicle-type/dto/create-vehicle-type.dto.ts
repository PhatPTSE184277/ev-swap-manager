import { StringRequired, NumberRequired, BooleanNotRequired, StringNotRequired } from 'src/common/decorators';

export class CreateVehicleTypeDto {
    @NumberRequired('ID loại pin')
    batteryTypeId: number;

    @StringRequired('Model xe', 1, 100)
    model: string;

    @StringNotRequired('Mô tả')
    description?: string;
}