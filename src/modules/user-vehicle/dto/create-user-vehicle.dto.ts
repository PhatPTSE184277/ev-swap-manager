import { NumberRequired, StringRequired } from 'src/common/decorators';

export class CreateUserVehicleDto {
    @NumberRequired('Loại xe')
    vehicleTypeId: number;

    @StringRequired('Tên xe')
    name: string;
}