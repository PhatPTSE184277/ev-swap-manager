import { NumberRequired, StringRequired } from 'src/common/decorators';

export class CreateUserVehicleDto {
    @StringRequired('Người dùng')
    userNameOrEmail: string;

    @NumberRequired('Loại xe')
    vehicleTypeId: number;

    @StringRequired('Tên xe')
    name: string;
}