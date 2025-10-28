import {
    Injectable,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Slot } from 'src/entities/slot.entity';
import { DataSource, Repository, Like } from 'typeorm';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { SlotStatus } from 'src/enums/slot.enum';

@Injectable()
export class SlotService {
    constructor(
        @InjectRepository(Slot)
        private readonly slotRepository: Repository<Slot>,
        private readonly dataSource: DataSource
    ) {}

    async findAll(
        page: number = 1,
        limit: number = 10,
        search?: string,
        order: 'ASC' | 'DESC' = 'DESC',
        status?: string,
        cabinetId?: number
    ): Promise<any> {
        try {
            let where: any = {};
            if (status) where.status = status;
            if (cabinetId) where.cabinetId = cabinetId;
            if (search) {
                where = [
                    { ...where, id: Like(`%${search}%`) },
                    { ...where, status: Like(`%${search}%`) }
                ];
            }

            const [data, total] = await this.slotRepository.findAndCount({
                where,
                order: { id: order },
                skip: (page - 1) * limit,
                take: limit,
                relations: ['cabinet', 'battery']
            });

            const mappedData = data.map(({ createdAt, updatedAt, ...rest }) => rest);

            return {
                data: mappedData,
                total,
                page,
                limit,
                message: 'Lấy danh sách slot thành công'
            };
        } catch (error) {
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi lấy danh sách slot');
        }
    }

    // async findSlotByCabinetId(cabinetId: number): Promise<any> {
    //     try {
    //         const slots = await this.slotRepository.find({
    //             where: { cabinetId },
    //             relations: ['battery']
    //         });
    //         if (slots.length === 0) {
    //             throw new NotFoundException('Không tìm thấy slot nào cho cabinetId đã cho');
    //         }
    //         return {
    //             data: slots,
    //             message: 'Lấy danh sách slot theo cabinetId thành công'
    //         };
    //     } catch (error) {
    //         if (error instanceof NotFoundException || error instanceof BadRequestException) {
    //             throw error;
    //         }
    //         throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi lấy slot theo cabinetId');
    //     }
    // }

   async findById(id: number): Promise<any> {
    try {
        const slot = await this.slotRepository.findOne({
            where: { id },
            relations: ['cabinet', 'battery']
        });
        if (!slot) throw new NotFoundException('Slot không tồn tại');
        const { createdAt, updatedAt, cabinet, battery, ...rest } = slot;

        let batteryData: any = null;
        if (battery) {
            const { createdAt, updatedAt, ...batteryRest } = battery;
            batteryData = batteryRest;
        }

        return {
            data: {
                ...rest,
                battery: batteryData
            },
            message: 'Lấy chi tiết slot thành công'
        };
    } catch (error) {
        if (error instanceof NotFoundException) throw error;
        throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi lấy chi tiết slot');
    }
}

    async create(createDto: CreateSlotDto): Promise<any> {
        try {
            const result = await this.dataSource.transaction(async (manager) => {
                const existed = await manager.findOne(Slot, {
                    where: {
                        cabinetId: createDto.cabinetId,
                        batteryId: createDto.batteryId
                    }
                });
                if (existed) {
                    throw new BadRequestException('Slot đã tồn tại với battery này trong cabinet');
                }

                const newSlot = manager.create(Slot, createDto);
                await manager.save(Slot, newSlot);

                const { createdAt, updatedAt, ...rest } = newSlot;
                return {
                    data: rest,
                    message: 'Tạo slot thành công'
                };
            });
            return result;
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi tạo slot');
        }
    }

    async update(id: number, updateDto: UpdateSlotDto): Promise<any> {
        try {
            const result = await this.dataSource.transaction(async (manager) => {
                const slot = await manager.findOne(Slot, { where: { id } });
                if (!slot) throw new NotFoundException('Slot không tồn tại');
                Object.assign(slot, updateDto);
                await manager.update(Slot, id, slot);
                return { message: 'Cập nhật slot thành công' };
            });
            return result;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi cập nhật slot');
        }
    }

    async softDelete(id: number): Promise<any> {
        try {
            const result = await this.dataSource.transaction(async (manager) => {
                const slot = await manager.findOne(Slot, { where: { id } });
                if (!slot) throw new NotFoundException('Slot không tồn tại');
                if (slot.status === SlotStatus.MAINTENANCE)
                    throw new BadRequestException('Slot đã bị xóa trước đó');
                slot.status = SlotStatus.MAINTENANCE;
                await manager.save(Slot, slot);
                return { message: 'Xóa slot thành công' };
            });
            return result;
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi xóa slot');
        }
    }

    async restore(id: number): Promise<any> {
        try {
            const result = await this.dataSource.transaction(async (manager) => {
                const slot = await manager.findOne(Slot, { where: { id } });
                if (!slot) throw new NotFoundException('Slot không tồn tại');
                if (slot.status !== SlotStatus.MAINTENANCE)
                    throw new BadRequestException('Slot đã được kích hoạt sẵn');
                slot.status = SlotStatus.EMPTY;
                await manager.save(Slot, slot);
                return { message: 'Khôi phục slot thành công' };
            });
            return result;
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(error?.message || 'Lỗi hệ thống khi khôi phục slot');
        }
    }
}