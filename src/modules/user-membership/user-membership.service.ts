import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Membership, Transaction, User, UserMembership } from 'src/entities';
import { DataSource, LessThan, MoreThan, Repository } from 'typeorm';
import { CreateUserMembershipDto } from './dto/create-user-membership.dto';
import { TransactionStatus, UserMembershipStatus } from '../../enums';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TransactionService } from '../transaction/transaction.service';
import { UpgradeUserMembershipDto } from './dto/upgrade-user-membership.dto';

@Injectable()
export class UserMembershipService {
    constructor(
        @InjectRepository(UserMembership)
        private readonly userMembershipRepository: Repository<UserMembership>,
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
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
                            },
                            relations: ['membership']
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

                    const cancelledMembership = await manager.findOne(
                        UserMembership,
                        {
                            where: {
                                userId,
                                status: UserMembershipStatus.CANCELLED,
                                expiredDate: MoreThan(now)
                            }
                        }
                    );

                    let bonusSwaps: number = 0;
                    if (
                        cancelledMembership &&
                        cancelledMembership.remainingSwaps === 1
                    ) {
                        bonusSwaps = 1;
                    }

                    const userMembership = manager.create(UserMembership, {
                        userId: user.id,
                        membershipId: membership.id,
                        remainingSwaps:
                            typeof membership.swapLimit === 'number'
                                ? membership.swapLimit + bonusSwaps
                                : 1,
                        paymentExpireAt: new Date(
                            now.getTime() + 20 * 60 * 1000
                        ),
                        status: UserMembershipStatus.PENDING
                    });

                    const totalPrice =
                        typeof membership.price === 'string'
                            ? parseFloat(membership.price)
                            : Number(membership.price);

                    await manager.save(userMembership);

                    const transactionResult =
                        await this.transactionService.createMembershipTransaction(
                            {
                                paymentId: createUserMembershipDto.paymentId,
                                userMembershipId: userMembership.id,
                                totalPrice: totalPrice
                            },
                            manager
                        );

                    return {
                        message: 'Tạo User Membership thành công',
                        paymentUrl: transactionResult.paymentUrl
                    };
                }
            );

            return result;
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(
                error?.message || 'Lỗi hệ thống khi tạo User Membership'
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

            const mappedData = await Promise.all(
                data.map(
                    async ({
                        membership,
                        membershipId,
                        updatedAt,
                        ...rest
                    }) => {
                        if (!membership) return { ...rest, membership: null };

                        const {
                            createdAt: _createdAt,
                            updatedAt: _updatedAt,
                            status: _status,
                            ...membershipData
                        } = membership;

                        let paymentUrl: string | null = null;

                        if (rest.status === UserMembershipStatus.PENDING) {
                            const transaction =
                                await this.transactionRepository.findOne({
                                    where: {
                                        userMembership: { id: rest.id },
                                        status: TransactionStatus.PENDING
                                    },
                                    order: { createdAt: 'DESC' },
                                    relations: ['userMembership']
                                });

                            if (transaction?.paymentUrl) {
                                paymentUrl = transaction.paymentUrl;
                            }
                        }

                        return {
                            ...rest,
                            membership: membershipData,
                            paymentUrl
                        };
                    }
                )
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

    async cancelActiveMemberships(
        userId: number,
        userMembershipId: number
    ): Promise<any> {
        try {
            const userMembership = await this.userMembershipRepository.findOne({
                where: {
                    id: userMembershipId,
                    userId,
                    status: UserMembershipStatus.ACTIVE
                }
            });
            if (!userMembership) {
                throw new NotFoundException(
                    'Gói thành viên không tồn tại hoặc không thể hủy'
                );
            }

            userMembership.status = UserMembershipStatus.CANCELLED;
            await this.userMembershipRepository.save(userMembership);

            return { message: 'Hủy gói thành viên thành công' };
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Lỗi hệ thống khi hủy gói thành viên'
            );
        }
    }

    async upgradeUserMembership(
        userId: number,
        dto: UpgradeUserMembershipDto
    ): Promise<any> {
        try {
            const result = await this.dataSource.transaction(
                async (manager) => {
                    const currentUserMembership = await manager.findOne(
                        UserMembership,
                        {
                            where: {
                                userId: userId,
                                status: UserMembershipStatus.ACTIVE
                            },
                            relations: ['membership']
                        }
                    );

                    if (!currentUserMembership) {
                        throw new NotFoundException(
                            'Không có gói thành viên nào đang hoạt động để nâng cấp'
                        );
                    }

                    const oldMembership = currentUserMembership.membership;
                    if (!oldMembership) {
                        throw new BadRequestException(
                            'Dữ liệu gói hiện tại không hợp lệ'
                        );
                    }

                    if (
                        oldMembership.swapLimit === null ||
                        oldMembership.swapLimit === 0
                    ) {
                        throw new BadRequestException(
                            'Bạn đang ở gói cao nhất, không thể nâng cấp thêm'
                        );
                    }

                    const newMembership = await manager.findOne(Membership, {
                        where: { id: dto.newMembershipId }
                    });

                    if (!newMembership) {
                        throw new NotFoundException(
                            'Gói thành viên mới không tồn tại'
                        );
                    }

                    const oldPrice =
                        typeof oldMembership.price === 'string'
                            ? parseFloat(oldMembership.price)
                            : Number(oldMembership.price);

                    const newPrice =
                        typeof newMembership.price === 'string'
                            ? parseFloat(newMembership.price)
                            : Number(newMembership.price);

                    if (isNaN(oldPrice) || isNaN(newPrice)) {
                        throw new BadRequestException('Giá gói không hợp lệ');
                    }

                    if (newPrice <= oldPrice) {
                        throw new BadRequestException(
                            'Chỉ được nâng cấp lên gói có giá cao hơn'
                        );
                    }

                    const existingPending = await manager.findOne(
                        UserMembership,
                        {
                            where: {
                                userId,
                                status: UserMembershipStatus.PENDING,
                                membershipId: newMembership.id
                            }
                        }
                    );

                    if (existingPending) {
                        throw new BadRequestException(
                            'Bạn đã có gói mới đang chờ thanh toán'
                        );
                    }

                    const remainingSwaps = Number(
                        currentUserMembership.remainingSwaps || 0
                    );
                    const oldSwapLimit = Number(oldMembership.swapLimit || 0);

                    let discountPercent = 0;
                    if (oldSwapLimit > 0) {
                        discountPercent = remainingSwaps / oldSwapLimit / 2;
                        if (discountPercent < 0) discountPercent = 0;
                        if (discountPercent > 1) discountPercent = 1;
                    }

                    const discountAmount = newPrice * discountPercent;
                    const finalPrice = Number(
                        (newPrice - discountAmount).toFixed(2)
                    );

                    currentUserMembership.status =
                        UserMembershipStatus.CANCELLED;
                    await manager.save(currentUserMembership);

                    const now = new Date();

                    const newUserMembership = manager.create(UserMembership, {
                        userId,
                        membershipId: newMembership.id,
                        remainingSwaps:
                            typeof newMembership.swapLimit === 'number'
                                ? newMembership.swapLimit
                                : 1,
                        paymentExpireAt: new Date(
                            now.getTime() + 20 * 60 * 1000
                        ),
                        status: UserMembershipStatus.PENDING
                    });

                    await manager.save(newUserMembership);

                    const transactionResult =
                        await this.transactionService.createMembershipTransaction(
                            {
                                paymentId: dto.paymentId,
                                userMembershipId: newUserMembership.id,
                                totalPrice: finalPrice
                            },
                            manager
                        );

                    return {
                        message:
                            'Tạo yêu cầu nâng cấp gói thành công, vui lòng thanh toán để kích hoạt',
                        paymentUrl: transactionResult.paymentUrl
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
                'Lỗi hệ thống khi nâng cấp gói thành viên'
            );
        }
    }
}
