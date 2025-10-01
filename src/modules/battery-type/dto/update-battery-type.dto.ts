import { BooleanNotRequired } from 'src/common/decorators';
import { PartialType } from '@nestjs/swagger';
import { CreateBatteryTypeDto } from './create-battery-type.dto';

export class UpdateBatteryTypeDto extends PartialType(CreateBatteryTypeDto) {
    @BooleanNotRequired('Trạng thái')
    status: boolean;
}