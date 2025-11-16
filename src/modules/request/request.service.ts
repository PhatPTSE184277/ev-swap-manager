import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateRequestDto } from './dto/create-request.dto';
import { AcceptRequestDto } from './dto/accept-request.dto';
import { Battery } from 'src/entities/battery.entity';
import { Station } from 'src/entities/station.entity';
import { BatteryType } from 'src/entities/battery-type.entity';
import { BatteryStatus, RequestStatus } from 'src/enums';
import { Request } from 'src/entities/request.entity';
import { RequestDetail } from 'src/entities/request-detail.entity';
import { RequestGateway } from 'src/gateways/request.gateway';

@Injectable()
export class RequestService {
    constructor(
        @InjectRepository(Request)
        private readonly requestRepository: Repository<Request>,
        @InjectRepository(Battery)
        private readonly batteryRepository: Repository<Battery>,
        @InjectRepository(RequestDetail)
        private readonly requestDetailRepository: Repository<RequestDetail>,
        private readonly dataSource: DataSource,
        private readonly requestGateway: RequestGateway
    ) {}

    // STAFF tạo request yêu cầu pin
    async createRequest(
        dto: CreateRequestDto,
        userId: number
    ): Promise<{ message: string }> {
        try {
            const station = await this.dataSource
                .getRepository(Station)
                .findOne({
                    where: { id: dto.stationId }
                });
            if (!station) {
                throw new NotFoundException('Trạm không tồn tại');
            }

            const batteryType = await this.dataSource
                .getRepository(BatteryType)
                .findOne({
                    where: { id: dto.batteryTypeId }
                });
            if (!batteryType) {
                throw new NotFoundException('Loại pin không tồn tại');
            }

            if (dto.quantity <= 0) {
                throw new BadRequestException('Số lượng phải lớn hơn 0');
            }

            const request = this.requestRepository.create({
                stationId: dto.stationId,
                batteryTypeId: dto.batteryTypeId,
                requestedBy: userId,
                requestedQuantity: dto.quantity,
                status: RequestStatus.PENDING
            });

            const savedRequest = await this.requestRepository.save(request);

            this.requestGateway.emitRequestCreated({
                requestId: savedRequest.id,
                stationId: savedRequest.stationId,
                batteryTypeId: savedRequest.batteryTypeId,
                requestedQuantity: savedRequest.requestedQuantity,
                status: savedRequest.status
            });

            return {
                message: 'Tạo yêu cầu cấp pin thành công'
            };
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi tạo yêu cầu cấp pin'
            );
        }
    }

    // ADMIN accept request và phân bổ pin
    async acceptRequest(
        requestId: number,
        dto: AcceptRequestDto
    ): Promise<{ message: string }> {
        try {
            const result = await this.dataSource.transaction(
                async (manager) => {
                    const request = await manager.findOne(Request, {
                        where: { id: requestId },
                        relations: ['station', 'batteryType']
                    });

                    if (!request) {
                        throw new NotFoundException('Request không tồn tại');
                    }

                    if (request.status !== RequestStatus.PENDING) {
                        throw new BadRequestException('Request đã được xử lý');
                    }

                    // Kiểm tra batteryIds truyền lên
                    if (
                        !dto.batteryIds ||
                        !Array.isArray(dto.batteryIds) ||
                        dto.batteryIds.length === 0
                    ) {
                        throw new BadRequestException(
                            'Vui lòng chọn pin để cấp'
                        );
                    }

                    // Lấy thông tin pin từ kho
                    const batteries = await manager.findByIds(
                        Battery,
                        dto.batteryIds
                    );

                    // Kiểm tra pin hợp lệ: đúng loại, chưa sử dụng, status AVAILABLE
                    const validBatteries = batteries.filter(
                        (b) =>
                            b.batteryTypeId === request.batteryTypeId &&
                            b.inUse === false &&
                            b.status === BatteryStatus.AVAILABLE
                    );
                    if (validBatteries.length !== dto.batteryIds.length) {
                        throw new BadRequestException(
                            'Có pin không hợp lệ, đã được sử dụng hoặc không ở trạng thái AVAILABLE'
                        );
                    }

                    // Tạo RequestDetail cho từng pin được cấp (chưa cập nhật inUse)
                    const requestDetails = dto.batteryIds.map((batteryId) =>
                        manager.create(RequestDetail, {
                            requestId: request.id,
                            batteryId
                        })
                    );
                    await manager.save(RequestDetail, requestDetails);

                    // Cập nhật request sang TRANSFERRING
                    let note = dto.note || '';
                    if (dto.batteryIds.length < request.requestedQuantity) {
                        note = `Chỉ cấp được ${dto.batteryIds.length}/${request.requestedQuantity} pin. Kho hết pin hoặc admin cấp thiếu.${note ? ' ' + note : ''}`;
                    }

                    await manager.update(Request, requestId, {
                        status: RequestStatus.TRANSFERRING,
                        approvedQuantity: dto.batteryIds.length,
                        note
                    });

                    this.requestGateway.emitRequestAccepted({
                        requestId: request.id,
                        stationId: request.stationId,
                        approvedQuantity: dto.batteryIds.length,
                        requestedQuantity: request.requestedQuantity,
                        note
                    });

                    return {
                        message: `Đã cấp ${dto.batteryIds.length}/${request.requestedQuantity} pin cho trạm ${request.station.name}. Đang chờ staff bỏ pin vào tủ.`
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
                error?.message || 'Lỗi hệ thống khi accept request'
            );
        }
    }

    // ADMIN từ chối request
    async rejectRequest(
        requestId: number,
        note: string
    ): Promise<{ message: string }> {
        try {
            if (!note || note.trim() === '') {
                throw new BadRequestException(
                    'Lý do từ chối (note) là bắt buộc'
                );
            }

            const request = await this.requestRepository.findOne({
                where: { id: requestId }
            });

            if (!request) {
                throw new NotFoundException('Request không tồn tại');
            }

            if (request.status !== RequestStatus.PENDING) {
                throw new BadRequestException('Request đã được xử lý');
            }

            await this.requestRepository.update(requestId, {
                status: RequestStatus.CANCELLED,
                note: note
            });

            this.requestGateway.emitRequestRejected({
                requestId: request.id,
                stationId: request.stationId,
                note: note
            });

            return {
                message: 'Đã từ chối yêu cầu'
            };
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi từ chối request'
            );
        }
    }

    // ADMIN xem tất cả request
    async getAllRequestsForAdmin(
        page: number = 1,
        limit: number = 10,
        status?: RequestStatus,
        order: 'ASC' | 'DESC' = 'DESC'
    ): Promise<any> {
        try {
            const where: any = {};
            if (status) where.status = status;

            const [data, total] = await this.requestRepository.findAndCount({
                where,
                relations: [
                    'batteryType',
                    'station',
                    'requester',
                    'requestDetails',
                    'requestDetails.battery'
                ],
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: order }
            });

            const mappedData = data.map((request) => ({
                id: request.id,
                status: request.status,
                requestedQuantity: request.requestedQuantity,
                approvedQuantity: request.approvedQuantity,
                note: request.note,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt,
                batteryType: request.batteryType
                    ? {
                          id: request.batteryType.id,
                          name: request.batteryType.name
                      }
                    : null,
                station: request.station
                    ? {
                          id: request.station.id,
                          name: request.station.name,
                          address: request.station.address
                      }
                    : null,
                requester: request.requester
                    ? {
                          id: request.requester.id,
                          username: request.requester.username,
                          fullName: request.requester.fullName
                      }
                    : null,
                batteries:
                    request.requestDetails?.map((detail) => ({
                        id: detail.battery.id,
                        model: detail.battery.model,
                        healthScore: detail.battery.healthScore
                    })) || []
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

    // STAFF xem request của trạm mình
    async getRequestsByStation(
        stationId: number,
        page: number = 1,
        limit: number = 10,
        status?: RequestStatus,
        order: 'ASC' | 'DESC' = 'DESC'
    ): Promise<any> {
        try {
            const where: any = { stationId };
            if (status) where.status = status;

            const [data, total] = await this.requestRepository.findAndCount({
                where,
                relations: [
                    'batteryType',
                    'station',
                    'requester',
                    'requestDetails',
                    'requestDetails.battery'
                ],
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: order }
            });

            const mappedData = data.map((request) => ({
                id: request.id,
                status: request.status,
                requestedQuantity: request.requestedQuantity,
                approvedQuantity: request.approvedQuantity,
                note: request.note,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt,
                batteryType: request.batteryType
                    ? {
                          id: request.batteryType.id,
                          name: request.batteryType.name
                      }
                    : null,
                batteries:
                    request.requestDetails?.map((detail) => ({
                        id: detail.battery.id,
                        model: detail.battery.model,
                        healthScore: detail.battery.healthScore
                    })) || []
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
