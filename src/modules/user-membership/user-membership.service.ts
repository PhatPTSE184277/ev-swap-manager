import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Membership, User, UserMembership } from 'src/entities';
import { DataSource, LessThan, MoreThan, Repository } from 'typeorm';
import { CreateUserMembershipDto } from './dto/create-user-membership.dto';
import { UserMembershipStatus } from '../../enums';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TransactionService } from '../transaction/transaction.service';

@Injectable()
export class UserMembershipService {
    constructor(
        @InjectRepository(UserMembership)
        private readonly userMembershipRepository: Repository<UserMembership>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Membership)
        private readonly membershipRepository: Repository<Membership>,
        private readonly dataSource: DataSource,
        private readonly transactionService: TransactionService
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async expireUserMembershipsAndPayments() {
        const now = new Date();

        const expiredMemberships = await this.userMembershipRepository.find({
            where: {
                status: UserMembershipStatus.ACTIVE,
                expiredDate: LessThan(now)
            }
        });

        for (const membership of expiredMemberships) {
            membership.status = UserMembershipStatus.EXPIRED;
            await this.userMembershipRepository.save(membership);
        }

        const expiredPayments = await this.userMembershipRepository.find({
            where: {
                status: UserMembershipStatus.PENDING,
                paymentExpireAt: LessThan(now)
            }
        });

        for (const membership of expiredPayments) {
            membership.status = UserMembershipStatus.CANCELLED;
            await this.userMembershipRepository.save(membership);
        }
    }

    async create(
        userId: number,
        createUserMembershipDto: CreateUserMembershipDto
    ): Promise<{ message: string }> {
        try {
            const result = await this.dataSource.transaction(
                async (manager) => {
                    const user = await manager.findOne(User, {
                        where: { id: userId }
                    });

                    if (!user) {
                        throw new BadRequestException(
                            'Người dùng không tồn tại'
                        );
                    }

                    const membership = await manager.findOne(Membership, {
                        where: { id: createUserMembershipDto.membershipId }
                    });

                    if (!membership)
                        throw new BadRequestException(
                            'Gói thành viên không tồn tại'
                        );

                    const now = new Date();
                    const existingUserMembership = await manager.findOne(
                        UserMembership,
                        {
                            where: {
                                userId,
                                status: UserMembershipStatus.ACTIVE,
                                expiredDate: MoreThan(now)
                            }
                        }
                    );
                    if (existingUserMembership) {
                        throw new BadRequestException(
                            'Người dùng đã có gói thành viên đang hoạt động'
                        );
                    }

                    const existingPending = await manager.findOne(
                        UserMembership,
                        {
                            where: {
                                userId,
                                status: UserMembershipStatus.PENDING,
                                paymentExpireAt: MoreThan(now)
                            }
                        }
                    );

                    if (existingPending) {
                        throw new BadRequestException(
                            'Bạn đã có gói thành viên đang chờ thanh toán'
                        );
                    }

                    const expiredDate = new Date();
                    expiredDate.setDate(
                        expiredDate.getDate() + membership.duration
                    );

                    const userMembership = manager.create(UserMembership, {
                        userId: user.id,
                        membershipId: membership.id,
                        remainingSwaps:
                            typeof membership.swapLimit === 'number'
                                ? membership.swapLimit
                                : 0,
                        paymentExpireAt: new Date(
                            now.getTime() + 20 * 60 * 1000
                        ),
                        status: UserMembershipStatus.PENDING,

                    });
                    await manager.save(userMembership);

                    await this.transactionService.createMembershipTransaction({
                        paymentId: createUserMembershipDto.paymentId,
                        userMembershipId: userMembership.id,
                        totalPrice: membership.price
                    });

                    return { message: 'Tạo User Membership thành công' };
                }
            );

            return result;
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(
                'Lỗi hệ thống khi tạo User Membership'
            );
        }
    }

    async getAllByUser(
        userId: number,
        page: number = 1,
        limit: number = 10,
        search?: string,
        status?: UserMembershipStatus
    ): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        message: string;
    }> {
        try {
            const where: any = { userId };
            if (status) where.status = status;

            if (search) {
                where.membership = {
                    name: () => `LIKE '%${search}%'`
                };
            }

            const [data, total] =
                await this.userMembershipRepository.findAndCount({
                    where,
                    relations: ['membership'],
                    skip: (page - 1) * limit,
                    take: limit,
                    order: { createdAt: 'DESC' }
                });

            const mappedData = data.map(
                ({ membership, membershipId, updatedAt, ...rest }) => {
                    if (!membership) return { ...rest, membership: null };
                    const {
                        createdAt: _createdAt,
                        updatedAt: _updatedAt,
                        status: _status,
                        ...membershipData
                    } = membership;
                    return {
                        ...rest,
                        membership: membershipData
                    };
                }
            );

            return {
                data: mappedData,
                total,
                page,
                limit,
                message:
                    'Lấy danh sách gói thành viên của người dùng thành công'
            };
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }
            throw new InternalServerErrorException(
                'Lỗi hệ thống khi lấy danh sách User Membership'
            );
        }
    }
}
