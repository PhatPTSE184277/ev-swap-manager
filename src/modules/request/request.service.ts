import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateRequestDto } from './dto/create-request.dto';
import { Battery } from 'src/entities/battery.entity';
import { Station } from 'src/entities/station.entity';
import { RequestStatus } from 'src/enums';
import { Request } from 'src/entities/request.entity';

@Injectable()
export class RequestService {
    constructor(
        @InjectRepository(Request)
        private readonly requestRepository: Repository<Request>,
        private readonly dataSource: DataSource
    ) {}

    async createRequest(dto: CreateRequestDto): Promise<Request> {
        try {
            return await this.dataSource.transaction(async (manager) => {
                // Kiểm tra pin tồn tại
                const battery = await manager.findOne(Battery, {
                    where: { id: dto.batteryId }
                });
                if (!battery) throw new NotFoundException('Pin không tồn tại');

                // Kiểm tra trạm hiện tại tồn tại
                const currentStation = await manager.findOne(Station, {
                    where: { id: dto.currentStationId }
                });
                if (!currentStation)
                    throw new NotFoundException('Trạm hiện tại không tồn tại');

                // Kiểm tra trạm mới tồn tại
                const newStation = await manager.findOne(Station, {
                    where: { id: dto.newStationId }
                });
                if (!newStation)
                    throw new NotFoundException('Trạm mới không tồn tại');

                // Tạo request
                const request = manager.create(Request, {
                    batteryId: dto.batteryId,
                    currentStationId: dto.currentStationId,
                    newStationId: dto.newStationId,
                    status: RequestStatus.PENDING
                });

                return await manager.save(Request, request);
            });
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi tạo yêu cầu chuyển đổi trạm'
            );
        }
    }
}
