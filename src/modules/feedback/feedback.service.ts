import {
    BadRequestException,
    Injectable,
    InternalServerErrorException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking, Feedback } from 'src/entities';
import { DataSource, ILike, Like, Repository } from 'typeorm';
import { CreateFeedbackDto } from './dto/create-feedback';
import { BookingStatus } from 'src/enums';
import { UpdateFeedbackDto } from './dto/update-feedback';

@Injectable()
export class FeedbackService {
    constructor(
        @InjectRepository(Feedback)
        private readonly feedbackRepository: Repository<Feedback>,
        private readonly datasource: DataSource
    ) {}

    async createFeedback(userId: number, dto: CreateFeedbackDto): Promise<any> {
        try {
            const result = await this.datasource.transaction(
                async (manager) => {
                    const booking = await manager.findOne(Booking, {
                        where: {
                            stationId: dto.stationId,
                            status: BookingStatus.COMPLETED
                        },
                        relations: ['userVehicle']
                    });

                    if (!booking || booking.userVehicle.userId !== userId) {
                        throw new BadRequestException(
                            'Không tìm thấy lịch sử đặt chỗ phù hợp để tạo phản hồi'
                        );
                    }

                    const existingFeedback = await manager.findOne(Feedback, {
                        where: {
                            userId: userId,
                            stationId: dto.stationId
                        }
                    });

                    if (existingFeedback) {
                        throw new BadRequestException(
                            'Bạn đã gửi phản hồi cho trạm này trước đó'
                        );
                    }

                    const newFeedback = manager.create(Feedback, {
                        userId: userId,
                        stationId: dto.stationId,
                        rating: dto.rating,
                        content: dto.content
                    });
                    await manager.save(Feedback, newFeedback);

                    return { message: 'Tạo phản hồi thành công' };
                }
            );
            return result;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new InternalServerErrorException(
                error.message || 'Lỗi hệ thống khi tạo phản hồi'
            );
        }
    }

    async getFeedbacksByUser(
        userId: number,
        page: number = 1,
        limit: number = 10,
        search?: string,
        stationId?: number
    ): Promise<any> {
        try {
            const where: any = {};
            where.userId = userId;

            if (search) {
                where.content = Like(`%${search}%`);
            }

            if (stationId) {
                where.stationId = stationId;
            }

            const [feedbacks, total] =
                await this.feedbackRepository.findAndCount({
                    where,
                    skip: (page - 1) * limit,
                    take: limit,
                    order: { createdAt: 'DESC' }
                });

            return {
                data: feedbacks,
                total,
                page,
                limit,
                message: 'Lấy phản hồi thành công'
            };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new InternalServerErrorException(
                error.message || 'Lỗi hệ thống khi lấy phản hồi'
            );
        }
    }

    async getFeedbacksByStation(
        stationId: number,
        page: number = 1,
        limit: number = 10,
        search?: string
    ): Promise<any> {
        try {
            const where: any = {};

            if (search) {
                where.content = Like(`%${search}%`);
            }
            where.stationId = stationId;

            const [feedbacks, total] =
                await this.feedbackRepository.findAndCount({
                    where,
                    skip: (page - 1) * limit,
                    take: limit,
                    order: { createdAt: 'DESC' }
                });

            return {
                data: feedbacks,
                total,
                page,
                limit,
                message: 'Lấy phản hồi thành công'
            };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new InternalServerErrorException(
                error.message || 'Lỗi hệ thống khi lấy phản hồi'
            );
        }
    }

    async updateFeedback(
        feedbackId: number,
        userId: number,
        dto: UpdateFeedbackDto
    ): Promise<any> {
        try {
            const feedback = await this.feedbackRepository.findOne({
                where: { id: feedbackId, userId: userId }
            });

            if (!feedback) {
                throw new BadRequestException('Phản hồi không tồn tại');
            }

            feedback.rating = dto.rating ?? feedback.rating;
            feedback.content = dto.content ?? feedback.content;

            await this.feedbackRepository.save(feedback);

            return { message: 'Cập nhật phản hồi thành công' };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new InternalServerErrorException(
                error.message || 'Lỗi hệ thống khi cập nhật phản hồi'
            );
        }
    }
}
