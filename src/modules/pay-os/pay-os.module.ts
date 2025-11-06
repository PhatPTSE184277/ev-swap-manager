import { Module } from '@nestjs/common';
import { PayOSService } from './pay-os.service';
import { PayOSController } from './pay-os.controller';

@Module({
  controllers: [PayOSController],
  providers: [PayOSService],
})
export class PayOSModule {}
