import { Controller } from '@nestjs/common';
import { PayOSService } from './pay-os.service';

@Controller('pay-os')
export class PayOSController {
  constructor(private readonly payOsService: PayOSService) {}
}
