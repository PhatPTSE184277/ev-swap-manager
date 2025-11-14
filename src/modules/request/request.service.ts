import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, Repository } from 'typeorm';
import { CreateRequestDto } from './dto/create-request.dto';
import { Battery } from 'src/entities/battery.entity';
import { Station } from 'src/entities/station.entity';
import { BatteryStatus, RequestStatus } from 'src/enums';
import { Request } from 'src/entities/request.entity';
import { Cabinet } from 'src/entities/cabinet.entity';
import { Slot } from 'src/entities';
import { RequestGateway } from 'src/gateways/request.gateway';

@Injectable()
export class RequestService {
    constructor(
        @InjectRepository(Request)
        private readonly requestRepository: Repository<Request>,
        private readonly dataSource: DataSource,
        private readonly requestGateway: RequestGateway
    ) {}

    async createRequest(dto: CreateRequestDto): Promise<{ message: string }> {
        try {
            const result = await this.dataSource.transaction(
                async (manager) => {
                    const battery = await manager.findOne(Battery, {
                        where: { id: dto.batteryId }
                    });
                    if (!battery)
                        throw new NotFoundException('Pin không tồn tại');

                    const slot = await manager.findOne(Slot, {
                        where: { batteryId: dto.batteryId }
                    });
                    if (!slot)
                        throw new NotFoundException(
                            'Pin không nằm trong slot nào'
                        );

                    const cabinet = await manager.findOne(Cabinet, {
                        where: { id: slot.cabinetId }
                    });
                    if (!cabinet)
                        throw new NotFoundException(
                            'Không tìm thấy cabinet chứa pin'
                        );

                    const currentStationId = cabinet.stationId;
                    if (!currentStationId)
                        throw new NotFoundException(
                            'Trạm hiện tại không tồn tại'
                        );

                    const newStation = await manager.findOne(Station, {
                        where: { id: dto.newStationId }
                    });
                    if (!newStation)
                        throw new NotFoundException('Trạm mới không tồn tại');

                    if (
                        battery.status === BatteryStatus.RESERVED ||
                        battery.status === BatteryStatus.IN_USE
                    ) {
                        throw new BadRequestException(
                            'Pin đang được sử dụng hoặc đã được đặt, không thể chuyển'
                        );
                    }

                    const request = manager.create(Request, {
                        batteryId: dto.batteryId,
                        currentStationId: currentStationId,
                        newStationId: dto.newStationId,
                        status: RequestStatus.PENDING
                    });

                    const savedRequest = await manager.save(Request, request);

                    await manager.update(Battery, dto.batteryId, {
                        inUse: false
                    });

                    this.requestGateway.emitRequestCreated({
                        requestId: savedRequest.id,
                        batteryId: savedRequest.batteryId,
                        currentStationId: savedRequest.currentStationId,
                        newStationId: savedRequest.newStationId,
                        status: savedRequest.status
                    });

                    return {
                        message: 'Tạo yêu cầu chuyển đổi trạm thành công'
                    };
                }
            );

            return result;
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

    async getAllRequestsForAdmin(
        page: number = 1,
        limit: number = 10,
        status?: RequestStatus,
        search?: string,
        order: 'ASC' | 'DESC' = 'DESC'
    ): Promise<any> {
        try {
            const where: any = {};
            if (status) where.status = status;

            if (search) {
                where.battery = { model: Like(`%${search}%`) };
            }

            const [data, total] = await this.requestRepository.findAndCount({
                where,
                relations: [
                    'battery',
                    'battery.batteryType',
                    'currentStation',
                    'newStation'
                ],
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: order }
            });

            const mappedData = data.map((request) => ({
                id: request.id,
                status: request.status,
                note: request.note,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt,
                battery: request.battery
                    ? {
                          id: request.battery.id,
                          model: request.battery.model,
                          currentCycle: request.battery.currentCycle,
                          healthScore: request.battery.healthScore,
                          status: request.battery.status,
                          inUse: request.battery.inUse,
                          batteryType: request.battery.batteryType
                              ? {
                                    id: request.battery.batteryType.id,
                                    name: request.battery.batteryType.name
                                }
                              : null
                      }
                    : undefined,
                currentStation: request.currentStation
                    ? {
                          id: request.currentStation.id,
                          name: request.currentStation.name,
                          address: request.currentStation.address
                      }
                    : undefined,
                newStation: request.newStation
                    ? {
                          id: request.newStation.id,
                          name: request.newStation.name,
                          address: request.newStation.address
                      }
                    : undefined
            }));

            return {
                data: mappedData,
                total,
                page,
                limit,
                message: 'Lấy danh sách request thành công'
            };
        } catch (error) {
            throw new InternalServerErrorException(
                error.message || 'Lỗi hệ thống xảy ra khi lấy danh sách request'
            );
        }
    }

    async getRequestsByStation(
        stationId: number,
        page: number = 1,
        limit: number = 10,
        status?: RequestStatus,
        order: 'ASC' | 'DESC' = 'DESC'
    ): Promise<any> {
        try {
            const where: any = [
                { currentStationId: stationId },
                { newStationId: stationId }
            ];
            if (status) {
                where[0].status = status;
                where[1].status = status;
            }

            const [data, total] = await this.requestRepository.findAndCount({
                where,
                relations: [
                    'battery',
                    'battery.batteryType',
                    'currentStation',
                    'newStation'
                ],
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: order }
            });

            const mappedData = data.map((request) => ({
                id: request.id,
                status: request.status,
                note: request.note,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt,
                battery: request.battery
                    ? {
                          id: request.battery.id,
                          model: request.battery.model,
                          currentCycle: request.battery.currentCycle,
                          healthScore: request.battery.healthScore,
                          status: request.battery.status,
                          inUse: request.battery.inUse,
                          batteryType: request.battery.batteryType
                              ? {
                                    id: request.battery.batteryType.id,
                                    name: request.battery.batteryType.name
                                }
                              : null
                      }
                    : undefined,
                currentStation: request.currentStation
                    ? {
                          id: request.currentStation.id,
                          name: request.currentStation.name,
                          address: request.currentStation.address
                      }
                    : undefined,
                newStation: request.newStation
                    ? {
                          id: request.newStation.id,
                          name: request.newStation.name,
                          address: request.newStation.address
                      }
                    : undefined
            }));

            return {
                data: mappedData,
                total,
                page,
                limit,
                message: 'Lấy danh sách request theo trạm thành công'
            };
        } catch (error) {
            throw new InternalServerErrorException(
                error.message ||
                    'Lỗi hệ thống xảy ra khi lấy danh sách request theo trạm'
            );
        }
    }
}
