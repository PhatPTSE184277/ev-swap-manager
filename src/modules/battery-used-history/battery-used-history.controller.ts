import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BatteryUsedHistoryService } from './battery-used-history.service';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleName } from 'src/enums';

@ApiTags('BatteryUsedHistory')
@ApiBearerAuth()
@Controller('battery-used-history')
export class BatteryUsedHistoryController {
  constructor(private readonly batteryUsedHistoryService: BatteryUsedHistoryService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.STAFF)
  @Get('battery/:batteryId')
  @ApiOperation({ summary: 'Lấy lịch sử sử dụng của 1 pin', description: 'ADMIN hoặc STAFF' })
  @ApiParam({ name: 'batteryId', type: Number, description: 'ID pin' })
  async findByBatteryId(@Param('batteryId') batteryId: number) {
    return this.batteryUsedHistoryService.findByBatteryId(batteryId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.STAFF)
  @Get('user/:userId')
  @ApiOperation({ summary: 'Lấy lịch sử sử dụng pin theo user', description: 'ADMIN hoặc STAFF' })
  @ApiParam({ name: 'userId', type: Number, description: 'ID user' })
  async findByUserId(@Param('userId') userId: number) {
    return this.batteryUsedHistoryService.findByUserId(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.STAFF)
  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Lấy lịch sử sử dụng pin theo booking', description: 'ADMIN hoặc STAFF' })
  @ApiParam({ name: 'bookingId', type: Number, description: 'ID booking' })
  async findByBookingId(@Param('bookingId') bookingId: number) {
    return this.batteryUsedHistoryService.findByBookingId(bookingId);
  }
}