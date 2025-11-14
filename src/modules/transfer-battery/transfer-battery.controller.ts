import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { TransferBatteryService } from './transfer-battery.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TakeBatteryDto } from './dto/take-battery.dto';
import { PutBatteryDto } from './dto/put-battery.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleName } from 'src/enums/role.enum';

@ApiTags('Transfer Battery')
@ApiBearerAuth()
@Controller('transfer-battery')
export class TransferBatteryController {
  constructor(private readonly transferBatteryService: TransferBatteryService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.STAFF)
  @Post('take-battery')
  @ApiOperation({ summary: 'Lấy pin hư/bảo trì ra khỏi slot để chuyển trạm (STAFF)' })
  async takeBatteryFromSlot(@Body() takeBatteryDto: TakeBatteryDto) {
    return this.transferBatteryService.takeBatteryFromSlot(takeBatteryDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.STAFF)
  @Post('put-battery')
  @ApiOperation({ summary: 'Bỏ pin vào slot sau khi chuyển trạm (STAFF)' })
  async putBatteryToSlot(@Body() putBatteryDto: PutBatteryDto) {
    return this.transferBatteryService.putBatteryToSlot(putBatteryDto);
  }
}
