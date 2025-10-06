import { Controller } from '@nestjs/common';
import { StationStaffService } from './station-staff.service';

@Controller('station-staff')
export class StationStaffController {
  constructor(private readonly stationStaffService: StationStaffService) {}
}
