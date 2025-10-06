import {
    BadRequestException,
    Injectable,
    NotFoundException,
    InternalServerErrorException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Membership } from 'src/entities';
import { DataSource, Like, Repository } from 'typeorm';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';

@Injectable()
export class MembershipService {
    constructor(
        @InjectRepository(Membership)
        private readonly membershipRepository: Repository<Membership>,
        private readonly dataSource: DataSource
    ) {}

    async findAll(
        page: number = 1,
        limit: number = 10,
        search?: string,
        order: 'ASC' | 'DESC' = 'ASC',
        status: boolean | string = true
    ): Promise<any> {
        try {
            const statusBool =
                typeof status === 'string' ? status === 'true' : !!status;
            let where: any = { status: statusBool };
            if (search) {
                where = [{ status: statusBool, name: Like(`%${search}%`) }];
            }

            const [data, total] = await this.membershipRepository.findAndCount({
                where,
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: order }
            });

            const mappedData = data.map(
                ({ createdAt, updatedAt, price, ...rest }) => ({
                    ...rest,
                    price: Number(price)
                })
            );

            return {
                data: mappedData,
                total,
                page,
                limit,
                message: 'Lấy danh sách gói thành công'
            };
        } catch (error) {
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi lấy danh sách gói'
            );
        }
    }

    async findAllPublic(
        page: number = 1,
        limit: number = 10,
        search?: string,
        order: 'ASC' | 'DESC' = 'ASC'
    ): Promise<any> {
        try {
            let where: any = { status: true };
            if (search) {
                where = [{ status: true, name: Like(`%${search}%`) }];
            }

            const [data, total] = await this.membershipRepository.findAndCount({
                where,
                skip: (page - 1) * limit,
                take: limit,
                order: { price: order }
            });

            const mappedData = data.map(
                ({ createdAt, updatedAt, status, price, ...rest }) => ({
                    ...rest,
                    price: Number(price)
                })
            );

            return {
                data: mappedData,
                total,
                page,
                limit,
                message: 'Lấy danh sách gói thành công'
            };
        } catch (error) {
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi lấy danh sách gói'
            );
        }
    }

    async findById(id: number): Promise<any> {
        try {
            const membership = await this.membershipRepository.findOne({
                where: { id }
            });
            if (!membership) {
                throw new NotFoundException('Gói không tồn tại');
            }
            const { createdAt, updatedAt, ...rest } = membership;
            return {
                data: rest,
                message: 'Lấy thông tin gói thành công'
            };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi lấy thông tin gói'
            );
        }
    }

    async create(createMembershipDto: CreateMembershipDto): Promise<any> {
        try {
            const result = await this.dataSource.transaction(
                async (manager) => {
                    const existed = await manager.findOne(Membership, {
                        where: { name: createMembershipDto.name }
                    });
                    if (existed) {
                        throw new BadRequestException('Tên gói đã tồn tại');
                    }

                    const newMembership = manager.create(
                        Membership,
                        createMembershipDto
                    );
                    await manager.save(Membership, newMembership);

                    return {
                        message: 'Tạo gói thành công'
                    };
                }
            );
            return result;
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi tạo gói'
            );
        }
    }

    async update(
        id: number,
        updateMembershipDto: UpdateMembershipDto
    ): Promise<any> {
        try {
            const membership = await this.membershipRepository.findOne({
                where: { id }
            });
            if (!membership) {
                throw new NotFoundException('Gói không tồn tại');
            }
            if (
                updateMembershipDto.name &&
                updateMembershipDto.name !== membership.name
            ) {
                const existed = await this.membershipRepository.findOne({
                    where: { name: updateMembershipDto.name }
                });
                if (existed) {
                    throw new BadRequestException('Tên gói đã tồn tại');
                }
            }

            Object.assign(membership, updateMembershipDto);
            await this.membershipRepository.update(id, membership);
            return {
                message: 'Cập nhật gói thành công'
            };
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            )
                throw error;
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi cập nhật gói'
            );
        }
    }

    async softDelete(id: number): Promise<any> {
        try {
            const membership = await this.membershipRepository.findOne({
                where: { id }
            });
            if (!membership) {
                throw new NotFoundException('Gói không tồn tại');
            }
            if (membership.status === false) {
                throw new BadRequestException('Gói đã bị xóa trước đó');
            }
            membership.status = false;
            await this.membershipRepository.save(membership);
            return {
                message: 'Xóa gói thành công'
            };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi xóa gói'
            );
        }
    }

    async restore(id: number): Promise<any> {
        try {
            const membership = await this.membershipRepository.findOne({
                where: { id }
            });
            if (!membership) {
                throw new NotFoundException('Gói không tồn tại');
            }
            if (membership.status === true) {
                throw new BadRequestException('Gói đã được kích hoạt trước đó');
            }
            membership.status = true;
            await this.membershipRepository.save(membership);
            return {
                message: 'Khôi phục gói thành công'
            };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi khôi phục gói'
            );
        }
    }
}
