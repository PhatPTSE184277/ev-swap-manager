import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateSlotDto } from './create-slot.dto';

export class UpdateSlotDto extends OmitType(
  PartialType(CreateSlotDto),
  ['cabinetId', 'batteryId'] as const
) {}