import {
    BadRequestException,
    Injectable,
    InternalServerErrorException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Membership, User, UserMembership } from 'src/entities';
import { DataSource, MoreThan, Repository } from 'typeorm';
import { CreateUserMembershipDto } from './dto/create-user-membership.dto';
import { UserMembershipStatus } from '../../enums';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UserMembershipService {
    constructor(
        @InjectRepository(UserMembership)
        private readonly userMembershipRepository: Repository<UserMembership>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Membership)
        private readonly membershipRepository: Repository<Membership>,
        private readonly dataSource: DataSource
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async expireUserMemberships() {
        const now = new Date();
        await this.userMembershipRepository
            .createQueryBuilder()
            .update(UserMembership)
            .set({ status: UserMembershipStatus.EXPIRED })
            .where('expiredDate < :now', { now })
            .andWhere('status = :active', {
                active: UserMembershipStatus.ACTIVE
            })
            .execute();
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

                    const expiredDate = new Date();
                    expiredDate.setDate(
                        expiredDate.getDate() + membership.duration
                    );

                    const userMembership = manager.create(UserMembership, {
                        userId: user.id,
                        membershipId: membership.id,
                        status: UserMembershipStatus.PENDING,
                        expiredDate
                    });
                    await manager.save(userMembership);
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
}
