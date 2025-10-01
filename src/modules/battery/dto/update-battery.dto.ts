import { PartialType } from '@nestjs/swagger';
import { CreateBatteryDto } from './create-battery.dto';
import { EnumNotRequired } from 'src/common/decorators';

export class UpdateBatteryDto extends PartialType(CreateBatteryDto) {
    @EnumNotRequired('Trạng thái', ['AVAILABLE', 'IN_USE', 'CHARGING', 'MAINTENANCE', 'DAMAGED'])
    status?: 'AVAILABLE' | 'IN_USE' | 'CHARGING' | 'MAINTENANCE' | 'DAMAGED';
}