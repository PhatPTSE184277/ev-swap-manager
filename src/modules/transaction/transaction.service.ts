import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction, UserMembership } from 'src/entities';
import { DataSource, Repository } from 'typeorm';
import { CreateMembershipTransactionDto } from './dto/create-membership-transaction.dto';
import { TransactionStatus, UserMembershipStatus } from 'src/enums';
import { PayOSService } from '../pay-os/pay-os.service';

@Injectable()
export class TransactionService {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        @InjectRepository(UserMembership)
        private readonly userMembershipRepository: Repository<UserMembership>,
        private readonly datasource: DataSource,
        private readonly payosService: PayOSService
    ) {}

    async createMembershipTransaction(
        dto: CreateMembershipTransactionDto,
        manager?: any
    ): Promise<any> {
        try {
            const executeTransaction = async (mgr: any) => {
                  if (!dto.totalPrice || dto.totalPrice <= 0) {
                    throw new BadRequestException('Số tiền phải lớn hơn 0');
                }

                const transaction = mgr.create(Transaction, {
                    paymentId: dto.paymentId,
                    userMembershipId: dto.userMembershipId,
                    totalPrice: dto.totalPrice,
                    dateTime: new Date(),
                    status: TransactionStatus.PENDING
                });
                const savedTransaction = await mgr.save(
                    Transaction,
                    transaction
                );

                if (!dto.totalPrice || dto.totalPrice <= 0) {
                    throw new BadRequestException('Số tiền phải lớn hơn 0');
                }

                const shortDescription = `Membership #${dto.userMembershipId}`;


                const paymentLinkRes =
                    await this.payosService.createPaymentLink({
                        orderCode: savedTransaction.id,
                        amount: dto.totalPrice,
                        description: shortDescription,
                        returnUrl: `${process.env.FRONTEND_URL}/payment/success`,
                        cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel`
                    });

                return {
                    transaction: savedTransaction,
                    paymentUrl:
                        paymentLinkRes?.checkoutUrl ||
                        paymentLinkRes.checkoutUrl
                };
            };

            if (manager) {
                return await executeTransaction(manager);
            }

            return await this.datasource.transaction(executeTransaction);
        } catch (error) {
            console.error(
                '[TransactionService][createMembershipTransaction] error:',
                error
            );

            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new InternalServerErrorException(
                error.message || 'Lỗi hệ thống khi tạo giao dịch thành viên'
            );
        }
    }

    async handlePayOSWebhook(webhookData: any): Promise<any> {
        try {
            const verifiedData =
                await this.payosService.verifyPaymentWebhookData(webhookData);

            if (!verifiedData) {
                throw new BadRequestException('Invalid webhook signature');
            }

            const { orderCode, code } = verifiedData;

            const transaction = await this.transactionRepository.findOne({
                where: { id: orderCode },
                relations: ['userMembership']
            });

            if (!transaction) {
                throw new NotFoundException('Giao dịch không tồn tại');
            }

            if (transaction.status !== TransactionStatus.PENDING) {
                return { message: 'Giao dịch đã được xử lý trước đó' };
            }

            await this.datasource.transaction(async (manager) => {
                if (code === '00') {
                    transaction.status = TransactionStatus.SUCCESS;
                    await manager.save(Transaction, transaction);

                    const userMembership = await manager.findOne(
                        UserMembership,
                        {
                            where: { id: transaction.userMembershipId },
                            relations: ['membership']
                        }
                    );

                    if (userMembership) {
                        userMembership.status = UserMembershipStatus.ACTIVE;
                        const expiredDate = new Date();
                        expiredDate.setDate(
                            expiredDate.getDate() +
                                userMembership.membership.duration
                        );
                        userMembership.expiredDate = expiredDate;

                        await manager.save(UserMembership, userMembership);
                    }
                } else {
                    // Thanh toán thất bại
                    transaction.status = TransactionStatus.FAILED;
                    await manager.save(Transaction, transaction);

                    const userMembership = await manager.findOne(
                        UserMembership,
                        {
                            where: { id: transaction.userMembershipId }
                        }
                    );

                    if (userMembership) {
                        userMembership.status = UserMembershipStatus.CANCELLED;
                        await manager.save(UserMembership, userMembership);
                    }
                }
            });

            return { message: 'Webhook xử lý thành công' };
        } catch (error) {
            throw new InternalServerErrorException(
                error.message || 'Lỗi xử lý webhook PayOS'
            );
        }
    }

    async checkPaymentStatus(transactionId: number): Promise<any> {
        try {
            const transaction = await this.transactionRepository.findOne({
                where: { id: transactionId }
            });

            if (!transaction) {
                throw new NotFoundException('Giao dịch không tồn tại');
            }

            const paymentInfo =
                await this.payosService.getPaymentInfo(transactionId);

            return {
                transactionId: transaction.id,
                status: transaction.status,
                paymentStatus: paymentInfo.status,
                amount: transaction.totalPrice
            };
        } catch (error) {
            throw new InternalServerErrorException(
                error.message || 'Lỗi kiểm tra trạng thái thanh toán'
            );
        }
    }
}
