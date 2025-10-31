import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateCabinetDto } from './create-cabinet.dto';

export class UpdateCabinetDto extends OmitType(
    PartialType(CreateCabinetDto),
    ['slotCount', 'batteryTypeId'] as const
) {}