import { Body, Controller, Post } from '@nestjs/common';
import { SimulationService } from './simulation.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TakeBatteryDto } from './dto/take-battery.dto';
import { PutBatteryDto } from './dto/put-battery.dto';

@ApiTags('Simulation')
@Controller('simulation')
export class SimulationController {
    constructor(private readonly simulationService: SimulationService) {}

    @Post('take-battery')
    @ApiOperation({ summary: 'Lấy pin mới ra khỏi slot (giả lập đổi pin)' })
    async takeBatteryFromSlot(@Body() takeBatteryDto: TakeBatteryDto) {
        return this.simulationService.takeBatteryFromSlot(takeBatteryDto);
    }

    @Post('put-battery')
    @ApiOperation({ summary: 'Bỏ pin cũ vào slot để sạc (giả lập đổi pin)' })
    async putBatteryToSlot(@Body() putBatteryDto: PutBatteryDto) {
        return this.simulationService.putBatteryToSlot(putBatteryDto);
    }
}
