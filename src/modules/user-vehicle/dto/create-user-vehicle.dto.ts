import { ArrayMinSize, ArrayMaxSize, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { NumberRequired, StringRequired } from 'src/common/decorators';

class BatteryInfoDto {
    @NumberRequired('ID pin')
    batteryId: number;
}

export class CreateUserVehicleDto {
    @StringRequired('Người dùng')
    userNameOrEmail: string;

    @NumberRequired('Loại xe')
    vehicleTypeId: number;

    @StringRequired('Tên xe')
    name: string;

    @IsArray({ message: 'Danh sách pin phải là mảng' })
    @ArrayMinSize(2, { message: 'Phải có đúng 2 cục pin' })
    @ArrayMaxSize(2, { message: 'Phải có đúng 2 cục pin' })
    @ValidateNested({ each: true })
    @Type(() => BatteryInfoDto)
    batteries: BatteryInfoDto[];
}