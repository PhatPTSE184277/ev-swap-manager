import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from 'src/entities';
import { Like, Repository } from 'typeorm';

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>
    ) {}

    async getActivePayments(
        page: number = 1,
        limit: number = 10,
        search?: string,
        status: boolean = true
    ): Promise<any> {
        try {
            const where: any = {};
            if (search) {
                where.name = Like(`%${search}%`);
            }
            where.status = status;

            const [data, total] = await this.paymentRepository.findAndCount({
                where,
                take: limit,
                skip: (page - 1) * limit
            });

            const mappedData = data.map(
                ({ createdAt, updatedAt, status, ...rest }) => rest
            );

            return {
                data: mappedData,
                total,
                message: 'Lấy danh sách phương thức thanh toán thành công.'
            };
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }

            throw new InternalServerErrorException(
                error.message ||
                    'Lỗi hệ thống xảy ra khi lấy danh sách phương thức thanh toán.'
            );
        }
    }
}
