import {
    BadRequestException,
    Body,
    Controller,
    ForbiddenException,
    Get,
    Post,
    Query,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StationStaffService } from './station-staff.service';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiQuery,
    ApiTags
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleName } from 'src/enums';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TransferStationDto } from './dto/transferstation.dto';

@ApiTags('StationStaff')
@ApiBearerAuth()
@Controller('station-staff')
export class StationStaffController {
    constructor(private readonly stationStaffService: StationStaffService) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Get()
    @ApiOperation({
        summary: 'Lấy danh sách nhân viên trạm (phân trang, filter)'
    })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'status', required: false, type: Boolean })
    @ApiQuery({ name: 'stationId', required: false, type: Number })
    @ApiQuery({ name: 'isHead', required: false, type: Boolean })
    async getAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('status') status?: boolean,
        @Query('stationId') stationId?: number,
        @Query('isHead') isHead?: boolean
    ) {
        return this.stationStaffService.getAllStationStaff(
            page,
            limit,
            search,
            status,
            stationId,
            isHead
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.STAFF)
    @Get('by-station')
    @ApiOperation({
        summary:
            'Staff lấy danh sách nhân viên của trạm mình (phân trang, filter)'
    })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'status', required: false, type: Boolean })
    async getByStation(
        @Req() req,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('status') status?: boolean
    ) {
        return this.stationStaffService.getStationStaffByStation(
            req.user.stationId,
            page,
            limit,
            search,
            status
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Post('transfer')
    @ApiOperation({ summary: 'Chuyển trạm cho nhân viên (có lưu history)' })
    @ApiBody({ type: TransferStationDto })
    async transferStation(@Body() transferDto: TransferStationDto) {
        return this.stationStaffService.transferStation(transferDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    @Post('import-excel')
    @ApiOperation({
        summary:
            'Admin import nhân viên từ file Excel (tạo User + StationStaff + gửi email)'
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description:
                        'File Excel với cột: username, email, fullName, stationId'
                }
            }
        }
    })
    @UseInterceptors(FileInterceptor('file'))
    async importStaffFromExcel(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Vui lòng upload file Excel');
        }
        return this.stationStaffService.importStaffFromExcel(file);
    }
}
