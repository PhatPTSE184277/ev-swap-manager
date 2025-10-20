/* eslint-disable prefer-const */
import {
    Injectable,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cabinet } from 'src/entities/cabinet.entity';
import { DataSource, Like, Repository } from 'typeorm';
import { CreateCabinetDto } from './dto/create-cabinet.dto';
import { UpdateCabinetDto } from './dto/update-cabinet.dto';
import { SlotStatus } from 'src/enums';
import { Slot, Station } from 'src/entities';

@Injectable()
export class CabinetService {
    constructor(
        @InjectRepository(Cabinet)
        private readonly cabinetRepository: Repository<Cabinet>,
        private readonly dataSource: DataSource
    ) {}

    async findAll(
        page: number = 1,
        limit: number = 10,
        search?: string,
        order: 'ASC' | 'DESC' = 'ASC',
        stationId?: number,
        status?: boolean
    ): Promise<any> {
        try {
            let where: any = {};
            if (typeof status === 'boolean') where.status = status;
            if (stationId) where.stationId = stationId;
            if (search) {
                where = [
                    { ...where, name: Like(`%${search}%`) },
                    { ...where, id: Like(`%${search}%`) }
                ];
            }

            const [data, total] = await this.cabinetRepository.findAndCount({
                where,
                order: { id: order },
                skip: (page - 1) * limit,
                take: limit,
                relations: ['station']
            });

            const mappedData = data.map(
                ({ createdAt, updatedAt, ...rest }) => rest
            );

            return {
                data: mappedData,
                total,
                page,
                limit,
                message: 'Lấy danh sách tủ thành công'
            };
        } catch (error) {
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi lấy danh sách tủ'
            );
        }
    }

    async findById(id: number): Promise<any> {
        try {
            const cabinet = await this.cabinetRepository.findOne({
                where: { id },
                relations: ['slots']
            });
            if (!cabinet) {
                throw new NotFoundException('Tủ không tồn tại');
            }

            const { createdAt, updatedAt, status, slots, ...cabinetRest } =
                cabinet;

            const slotsData = (slots || []).map((slot) => {
                const { createdAt, updatedAt, cabinetId, ...slotRest } = slot;

                return {
                    ...slotRest
                };
            });

            return {
                data: {
                    ...cabinetRest,
                    slots: slotsData
                },
                message: 'Lấy thông tin tủ thành công'
            };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi lấy thông tin tủ'
            );
        }
    }

    async findActiveByStation(stationId: number): Promise<any> {
        try {
            const cabinets = await this.cabinetRepository.find({
                where: { stationId, status: true },
                relations: ['slots']
            });

            const mappedData = cabinets.map((cabinet) => {
                let available = 0;
                let charging = 0;
                let empty = 0;

                (cabinet.slots || []).forEach((slot) => {
                    if (slot.status === SlotStatus.AVAILABLE) available++;
                    else if (slot.status === SlotStatus.CHARGING) charging++;
                    else if (slot.status === SlotStatus.EMPTY) empty++;
                });

                const { createdAt, updatedAt, slots, ...rest } = cabinet;
                return {
                    ...rest,
                    availablePins: available,
                    chargingPins: charging,
                    emptySlots: empty
                };
            });

            return {
                data: mappedData,
                message: 'Lấy danh sách tủ đang hoạt động tại trạm thành công'
            };
        } catch (error) {
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi lấy danh sách tủ theo trạm'
            );
        }
    }

    async create(createCabinetDto: CreateCabinetDto): Promise<any> {
        try {
            const result = await this.dataSource.transaction(
                async (manager) => {
                    const existed = await manager.findOne(Cabinet, {
                        where: {
                            name: createCabinetDto.name,
                            stationId: createCabinetDto.stationId
                        }
                    });
                    if (existed) {
                        throw new BadRequestException(
                            'Tủ đã tồn tại tại trạm này'
                        );
                    }

                   const station = await manager.findOne(Station, {
                       where: {
                           id: createCabinetDto.stationId
                       }
                   });

                     if (!station) {
                            throw new NotFoundException('Trạm không tồn tại');
                    }

                    const newCabinet = manager.create(
                        Cabinet,
                        createCabinetDto
                    );
                    await manager.save(Cabinet, newCabinet);

                    for (let i = 1; i <= createCabinetDto.slotCount; i++) {
                        const slot = manager.create(Slot, {
                            cabinetId: newCabinet.id,
                            name: `Slot ${i}`,
                            status: SlotStatus.EMPTY
                        });
                        await manager.save(Slot, slot);
                    }

                    return {
                        message: 'Tạo tủ và slot thành công'
                    };
                }
            );
            return result;
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi tạo tủ'
            );
        }
    }

    async update(id: number, updateCabinetDto: UpdateCabinetDto): Promise<any> {
        try {
            const cabinet = await this.cabinetRepository.findOne({
                where: { id }
            });
            if (!cabinet) {
                throw new NotFoundException('Tủ không tồn tại');
            }

            if (
                updateCabinetDto.name &&
                updateCabinetDto.name !== cabinet.name
            ) {
                const existed = await this.cabinetRepository.findOne({
                    where: {
                        name: updateCabinetDto.name,
                        stationId: cabinet.stationId
                    }
                });
                if (existed) {
                    throw new BadRequestException(
                        'Tên tủ đã tồn tại tại trạm này'
                    );
                }
            }
            Object.assign(cabinet, updateCabinetDto);
            await this.cabinetRepository.update(id, cabinet);
            return {
                message: 'Cập nhật tủ thành công'
            };
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            )
                throw error;
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi cập nhật tủ'
            );
        }
    }

    async softDelete(id: number): Promise<any> {
        try {
            const cabinet = await this.cabinetRepository.findOne({
                where: { id }
            });
            if (!cabinet) {
                throw new NotFoundException('Tủ không tồn tại');
            }
            if (cabinet.status === false) {
                throw new BadRequestException('Tủ đã bị xóa trước đó');
            }
            cabinet.status = false;
            await this.cabinetRepository.save(cabinet);
            return {
                message: 'Xóa tủ thành công'
            };
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            )
                throw error;
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi xóa tủ'
            );
        }
    }

    async restore(id: number): Promise<any> {
        try {
            const cabinet = await this.cabinetRepository.findOne({
                where: { id }
            });
            if (!cabinet) {
                throw new NotFoundException('Tủ không tồn tại');
            }
            if (cabinet.status === true) {
                throw new BadRequestException(
                    'Tủ đã được kích hoạt sẵn trước đó'
                );
            }
            cabinet.status = true;
            await this.cabinetRepository.save(cabinet);
            return {
                message: 'Khôi phục tủ thành công'
            };
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            )
                throw error;
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi khôi phục tủ'
            );
        }
    }
}
