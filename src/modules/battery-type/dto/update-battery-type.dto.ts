import { PartialType } from '@nestjs/swagger';
import { CreateBatteryTypeDto } from './create-battery-type.dto';

export class UpdateBatteryTypeDto extends PartialType(CreateBatteryTypeDto) {
}