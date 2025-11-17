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
import { StationStaff } from 'src/entities';

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

            // Kiểm tra staff có thuộc trạm này không
            const staff = await this.dataSource
                .getRepository(StationStaff)
                .findOne({
                    where: {
                        userId: userId,
                        stationId: dto.stationId,
                        status: true
                    }
                });
            if (!staff) {
                throw new BadRequestException(
                    'Bạn không có quyền tạo request cho trạm này'
                );
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

                    if (request.isClosed) {
                        throw new BadRequestException(
                            'Request đã được đóng, không thể cấp thêm pin'
                        );
                    }

                    if (
                        request.status !== RequestStatus.PENDING &&
                        request.status !== RequestStatus.TRANSFERRING
                    ) {
                        throw new BadRequestException(
                            'Request không ở trạng thái phù hợp để cấp pin'
                        );
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

                    // Kiểm tra tổng số pin đã cấp + pin sắp cấp có vượt quá yêu cầu không
                    const currentApprovedQuantity =
                        request.approvedQuantity || 0;
                    const newTotalQuantity =
                        currentApprovedQuantity + dto.batteryIds.length;

                    if (newTotalQuantity > request.requestedQuantity) {
                        throw new BadRequestException(
                            `Không thể cấp ${dto.batteryIds.length} pin. Đã cấp ${currentApprovedQuantity}/${request.requestedQuantity}. Chỉ cần thêm ${request.requestedQuantity - currentApprovedQuantity} pin.`
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

                    // Tạo RequestDetail cho từng pin được cấp
                    const requestDetails = dto.batteryIds.map((batteryId) =>
                        manager.create(RequestDetail, {
                            requestId: request.id,
                            batteryId
                        })
                    );
                    await manager.save(RequestDetail, requestDetails);

                    // Cập nhật số lượng đã cấp
                    const updatedApprovedQuantity =
                        currentApprovedQuantity + dto.batteryIds.length;

                    // Kiểm tra đã cấp đủ chưa
                    const isFulfilled =
                        updatedApprovedQuantity >= request.requestedQuantity;

                    // Cập nhật request
                    let note = '';
                    if (isFulfilled) {
                        note = `Đã cấp đủ ${updatedApprovedQuantity}/${request.requestedQuantity} pin.`;
                    } else {
                        note = `Đã cấp ${updatedApprovedQuantity}/${request.requestedQuantity} pin. Còn thiếu ${request.requestedQuantity - updatedApprovedQuantity} pin.`;
                    }

                    await manager.update(Request, requestId, {
                        status: RequestStatus.TRANSFERRING,
                        approvedQuantity: updatedApprovedQuantity,
                        isClosed: isFulfilled, // Đóng request nếu đã cấp đủ
                        note
                    });

                    this.requestGateway.emitRequestAccepted({
                        requestId: request.id,
                        stationId: request.stationId,
                        approvedQuantity: updatedApprovedQuantity,
                        requestedQuantity: request.requestedQuantity,
                        note
                    });

                    return {
                        message: isFulfilled
                            ? `Đã cấp đủ ${updatedApprovedQuantity}/${request.requestedQuantity} pin cho trạm ${request.station.name}. Request đã đóng.`
                            : `Đã cấp ${updatedApprovedQuantity}/${request.requestedQuantity} pin cho trạm ${request.station.name}. Đang chờ staff bỏ pin vào tủ. Có thể tiếp tục cấp thêm pin.`
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

            if (request.isClosed) {
                throw new BadRequestException('Request đã được đóng');
            }

            if (
                request.status !== RequestStatus.PENDING &&
                request.status !== RequestStatus.TRANSFERRING
            ) {
                throw new BadRequestException(
                    'Request đã được xử lý hoặc không thể từ chối'
                );
            }

            await this.requestRepository.update(requestId, {
                status: RequestStatus.CANCELLED,
                isClosed: true,
                note: note
            });

            this.requestGateway.emitRequestRejected({
                requestId: request.id,
                stationId: request.stationId,
                note: note
            });

            return {
                message: 'Đã từ chối yêu cầu và đóng request'
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
                isClosed: request.isClosed,
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
                        healthScore: detail.battery.healthScore,
                        inUse: detail.battery.inUse,
                        status: detail.battery.status,
                        detailStatus: detail.status
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
        userId: number,
        page: number = 1,
        limit: number = 10,
        status?: RequestStatus,
        order: 'ASC' | 'DESC' = 'DESC'
    ): Promise<any> {
        try {
            // Kiểm tra staff có thuộc trạm này không
            const staff = await this.dataSource
                .getRepository(StationStaff)
                .findOne({
                    where: {
                        userId: userId,
                        stationId: stationId,
                        status: true
                    }
                });
            if (!staff) {
                throw new BadRequestException(
                    'Bạn không có quyền xem request của trạm này'
                );
            }

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
                isClosed: request.isClosed,
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
                        healthScore: detail.battery.healthScore,
                        inUse: detail.battery.inUse,
                        status: detail.battery.status,
                        detailStatus: detail.status
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
