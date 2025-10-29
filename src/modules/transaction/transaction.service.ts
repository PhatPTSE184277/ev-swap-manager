import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateMembershipTransactionDto } from './dto/create-membership-transaction.dto';
import {
    TransactionStatus,
    UserMembershipStatus,
    BookingStatus
} from 'src/enums';
import { PayOSService } from '../pay-os/pay-os.service';
import { CreateBookingTransactionDto } from './dto/create-booking-transaction.dto';
import { ConfirmCashPaymentDto } from './dto/confirm-cash-payment.dto';
import {
    Booking,
    Payment,
    Transaction,
    UserMembership,
    BookingDetail
} from 'src/entities';
import { BookingDetailStatus } from 'src/enums';

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

                const shortDescription = `Membership #${dto.userMembershipId}`;
                const userMembership = await mgr.findOne(UserMembership, {
                    where: { id: dto.userMembershipId }
                });

                const expiredAt = Math.floor(
                    new Date(userMembership.paymentExpireAt).getTime()
                );

                const paymentLinkRes =
                    await this.payosService.createPaymentLink({
                        orderCode: savedTransaction.id,
                        amount: dto.totalPrice,
                        description: shortDescription,
                        returnUrl: `${process.env.FRONTEND_URL}/payment/success`,
                        cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel`,
                        expiredAt
                    });

                const paymentUrl =
                    paymentLinkRes?.checkoutUrl || paymentLinkRes.checkoutUrl;

                savedTransaction.paymentUrl = paymentUrl;
                await mgr.save(Transaction, savedTransaction);

                return {
                    transaction: savedTransaction,
                    paymentUrl: paymentUrl
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
                where: { id: transactionId },
                relations: ['userMembership', 'userMembership.membership']
            });

            if (!transaction) {
                throw new NotFoundException('Giao dịch không tồn tại');
            }

            if (transaction.status !== TransactionStatus.PENDING) {
                return {
                    transactionId: transaction.id,
                    status: transaction.status,
                    amount: transaction.totalPrice,
                    message:
                        transaction.status === TransactionStatus.SUCCESS
                            ? 'Thanh toán thành công'
                            : transaction.status === TransactionStatus.FAILED
                              ? 'Thanh toán thất bại'
                              : 'Giao dịch đã bị hủy'
                };
            }

            try {
                const paymentInfo =
                    await this.payosService.getPaymentInfo(transactionId);

                if (paymentInfo.status === 'PAID') {
                    await this.datasource.transaction(async (manager) => {
                        transaction.status = TransactionStatus.SUCCESS;
                        await manager.save(Transaction, transaction);

    
                        if (transaction.userMembershipId) {
                            const userMembership = await manager.findOne(
                                UserMembership,
                                {
                                    where: { id: transaction.userMembershipId },
                                    relations: ['membership']
                                }
                            );

                            if (
                                userMembership &&
                                userMembership.status ===
                                    UserMembershipStatus.PENDING
                            ) {
                                userMembership.status =
                                    UserMembershipStatus.ACTIVE;
                                const expiredDate = new Date();
                                expiredDate.setDate(
                                    expiredDate.getDate() +
                                        userMembership.membership.duration
                                );
                                userMembership.expiredDate = expiredDate;
                                await manager.save(
                                    UserMembership,
                                    userMembership
                                );
                            }
                        }

                        const booking = await manager.findOne(Booking, {
                            where: { transactionId: transaction.id }
                        });

                        if (
                            booking &&
                            booking.status === BookingStatus.PENDING_PAYMENT
                        ) {
                            booking.status = BookingStatus.IN_PROGRESS;
                            await manager.save(Booking, booking);

                            const bookingDetails = await manager.find(
                                BookingDetail,
                                {
                                    where: { bookingId: booking.id }
                                }
                            );

                            for (const detail of bookingDetails) {
                                if (
                                    detail.status ===
                                    BookingDetailStatus.PENDING_PAYMENT
                                ) {
                                    detail.status =
                                        BookingDetailStatus.IN_PROGRESS;
                                    await manager.save(BookingDetail, detail);
                                }
                            }
                        }
                    });

                    return {
                        transactionId: transaction.id,
                        status: TransactionStatus.SUCCESS,
                        amount: transaction.totalPrice,
                        message: 'Thanh toán thành công'
                    };
                }

                if (
                    paymentInfo.status === 'CANCELLED' ||
                    paymentInfo.status === 'EXPIRED'
                ) {
                    await this.datasource.transaction(async (manager) => {
                        transaction.status = TransactionStatus.FAILED;
                        await manager.save(Transaction, transaction);

                        if (transaction.userMembershipId) {
                            const userMembership = await manager.findOne(
                                UserMembership,
                                {
                                    where: { id: transaction.userMembershipId }
                                }
                            );

                            if (userMembership) {
                                userMembership.status =
                                    UserMembershipStatus.CANCELLED;
                                await manager.save(
                                    UserMembership,
                                    userMembership
                                );
                            }
                        }

                        const booking = await manager.findOne(Booking, {
                            where: { transactionId: transaction.id }
                        });

                        if (booking) {
                            booking.status = BookingStatus.CANCELLED;
                            await manager.save(Booking, booking);
                        }
                    });

                    return {
                        transactionId: transaction.id,
                        status: TransactionStatus.FAILED,
                        amount: transaction.totalPrice,
                        message: 'Thanh toán thất bại hoặc đã hủy'
                    };
                }

                return {
                    transactionId: transaction.id,
                    status: TransactionStatus.PENDING,
                    amount: transaction.totalPrice,
                    message: 'Đang chờ thanh toán'
                };
            } catch (payosError) {
                console.error(
                    '[checkPaymentStatus] PayOS API error:',
                    payosError
                );
                return {
                    transactionId: transaction.id,
                    status: TransactionStatus.PENDING,
                    amount: transaction.totalPrice,
                    message: 'Đang chờ thanh toán'
                };
            }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(
                error.message || 'Lỗi kiểm tra trạng thái thanh toán'
            );
        }
    }

    async createBookingTransaction(
        dto: CreateBookingTransactionDto,
        manager?: any
    ): Promise<any> {
        try {
            const executeTransaction = async (mgr: any) => {
                if (!dto.totalPrice || dto.totalPrice <= 0) {
                    throw new BadRequestException('Số tiền phải lớn hơn 0');
                }

                const payment = await mgr.findOne(Payment, {
                    where: { id: dto.paymentId }
                });

                if (!payment) {
                    throw new BadRequestException(
                        'Phương thức thanh toán không hợp lệ'
                    );
                }

                const transaction = mgr.create(Transaction, {
                    paymentId: dto.paymentId,
                    totalPrice: dto.totalPrice,
                    dateTime: new Date(),
                    status: TransactionStatus.PENDING
                });
                const savedTransaction = await mgr.save(
                    Transaction,
                    transaction
                );

                const booking = await mgr.findOne(Booking, {
                    where: { id: dto.bookingId }
                });
                if (booking) {
                    booking.transactionId = savedTransaction.id;
                    await mgr.save(Booking, booking);
                }

                const isCashPayment =
                    payment.name.toLowerCase().includes('tiền mặt') ||
                    payment.name.toLowerCase().includes('cash');

                if (isCashPayment) {
                    return {
                        transaction: savedTransaction,
                        paymentMethod: 'CASH',
                        message:
                            'Vui lòng thanh toán tiền mặt tại quầy để hoàn tất đặt chỗ'
                    };
                } else {
                    const shortDescription = `Booking #${dto.bookingId}`;

                    const paymentLinkRes =
                        await this.payosService.createPaymentLink({
                            orderCode: savedTransaction.id,
                            amount: dto.totalPrice,
                            description: shortDescription,
                            returnUrl: `${process.env.FRONTEND_URL}/payment/success`,
                            cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel`
                        });

                    const paymentUrl =
                        paymentLinkRes?.checkoutUrl ||
                        paymentLinkRes.checkoutUrl;

                    savedTransaction.paymentUrl = paymentUrl;
                    await mgr.save(Transaction, savedTransaction);

                    return {
                        transaction: savedTransaction,
                        paymentMethod: 'ONLINE',
                        paymentUrl: paymentUrl
                    };
                }
            };

            if (manager) {
                return await executeTransaction(manager);
            }

            return await this.datasource.transaction(executeTransaction);
        } catch (error) {
            console.error(
                '[TransactionService][createBookingTransaction] error:',
                error
            );

            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new InternalServerErrorException(
                error.message || 'Lỗi hệ thống khi tạo giao dịch đặt chỗ'
            );
        }
    }

    async confirmCashPayment(dto: ConfirmCashPaymentDto): Promise<any> {
        try {
            return await this.datasource.transaction(async (manager) => {
                const transaction = await manager.findOne(Transaction, {
                    where: { id: dto.transactionId },
                    relations: [
                        'payment',
                        'userMembership',
                        'userMembership.membership'
                    ]
                });

                if (!transaction) {
                    throw new NotFoundException('Giao dịch không tồn tại');
                }

                if (transaction.status !== TransactionStatus.PENDING) {
                    throw new BadRequestException(
                        'Giao dịch đã được xử lý trước đó'
                    );
                }

                const isCashPayment =
                    transaction.payment.name
                        .toLowerCase()
                        .includes('tiền mặt') ||
                    transaction.payment.name.toLowerCase().includes('cash');

                if (!isCashPayment) {
                    throw new BadRequestException(
                        'Giao dịch này không phải thanh toán tiền mặt'
                    );
                }

                // Cập nhật transaction thành SUCCESS
                transaction.status = TransactionStatus.SUCCESS;
                await manager.save(Transaction, transaction);

                // Nếu là transaction của membership, kích hoạt membership
                if (transaction.userMembershipId) {
                    const userMembership = await manager.findOne(
                        UserMembership,
                        {
                            where: { id: transaction.userMembershipId },
                            relations: ['membership']
                        }
                    );

                    if (
                        userMembership &&
                        userMembership.status === UserMembershipStatus.PENDING
                    ) {
                        userMembership.status = UserMembershipStatus.ACTIVE;
                        const expiredDate = new Date();
                        expiredDate.setDate(
                            expiredDate.getDate() +
                                userMembership.membership.duration
                        );
                        userMembership.expiredDate = expiredDate;
                        await manager.save(UserMembership, userMembership);
                    }
                }

                const booking = await manager.findOne(Booking, {
                    where: { transactionId: transaction.id }
                });

                if (
                    booking &&
                    booking.status === BookingStatus.PENDING_PAYMENT
                ) {
                    booking.status = BookingStatus.IN_PROGRESS;
                    await manager.save(Booking, booking);

                    // Cập nhật booking details
                    const bookingDetails = await manager.find(BookingDetail, {
                        where: { bookingId: booking.id }
                    });

                    for (const detail of bookingDetails) {
                        if (
                            detail.status ===
                            BookingDetailStatus.PENDING_PAYMENT
                        ) {
                            detail.status = BookingDetailStatus.IN_PROGRESS;
                            await manager.save(BookingDetail, detail);
                        }
                    }
                }

                return {
                    message: 'Xác nhận thanh toán tiền mặt thành công',
                    transaction: {
                        id: transaction.id,
                        status: transaction.status,
                        totalPrice: transaction.totalPrice,
                        dateTime: transaction.dateTime
                    }
                };
            });
        } catch (error) {
            console.error(
                '[TransactionService][confirmCashPayment] error:',
                error
            );

            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }

            throw new InternalServerErrorException(
                error.message || 'Lỗi hệ thống khi xác nhận thanh toán tiền mặt'
            );
        }
    }
}
