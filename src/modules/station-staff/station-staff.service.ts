import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Station, StationStaff, StationStaffHistory } from 'src/entities';
import { DataSource, Like, MoreThanOrEqual, Repository } from 'typeorm';
import { TransferStationDto } from './dto/transferstation.dto';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import * as XLSX from 'xlsx';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class StationStaffService {
    constructor(
        @InjectRepository(StationStaff)
        private readonly stationStaffRepository: Repository<StationStaff>,
        @InjectRepository(StationStaffHistory)
        private readonly stationStaffHistoryRepository: Repository<StationStaffHistory>,
        @InjectRepository(Station)
        private readonly stationRepository: Repository<Station>,
        private readonly dataSource: DataSource,
        private readonly userService: UserService,
        private readonly mailService: MailService
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async autoTransferStation() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Lấy các lịch sử chuyển trạm chưa thực hiện (status = false) và đến ngày hôm nay
            const pendingTransfers =
                await this.stationStaffHistoryRepository.find({
                    where: {
                        status: false
                    },
                    relations: ['stationStaff']
                });

            for (const transfer of pendingTransfers) {
                const transferDate = new Date(transfer.date);
                transferDate.setHours(0, 0, 0, 0);

                // Nếu đến ngày chuyển trạm
                if (transferDate.getTime() <= today.getTime()) {
                    await this.dataSource.transaction(async (manager) => {
                        // Cập nhật stationId cho staff
                        await manager.update(
                            StationStaff,
                            { id: transfer.stationStaffId },
                            { stationId: transfer.stationId }
                        );

                        // Cập nhật trạng thái history
                        await manager.update(
                            StationStaffHistory,
                            { id: transfer.id },
                            { status: true }
                        );
                    });

                    console.log(
                        `[AutoTransferStation] Đã chuyển nhân viên ${transfer.stationStaffId} sang trạm ${transfer.stationId}`
                    );
                }
            }
        } catch (error) {
            console.error(
                '[AutoTransferStation] Lỗi:',
                error?.message || error
            );
        }
    }

    async getAllStationStaff(
        page: number = 1,
        limit: number = 10,
        search?: string,
        status?: boolean,
        stationId?: number,
        isHead?: boolean
    ): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        message: string;
    }> {
        const where: any = {};
        if (typeof status === 'boolean') where.status = status;
        if (typeof stationId === 'number') where.stationId = stationId;
        if (typeof isHead === 'boolean') where.isHead = isHead;

        if (search) {
            where.user = { fullName: Like(`%${search}%`) };
        }

        const [data, total] = await this.stationStaffRepository.findAndCount({
            where,
            relations: ['user', 'station'],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' }
        });

        const mappedData = data.map(
            ({
                user,
                station,
                createdAt,
                updatedAt,
                userId,
                stationId,
                ...rest
            }) => ({
                ...rest,
                user: {
                    id: user.id,
                    fullName: user.fullName
                },
                station: {
                    id: station.id,
                    name: station.name
                }
            })
        );

        return {
            data: mappedData,
            total,
            page,
            limit,
            message: 'Lấy danh sách nhân viên trạm thành công'
        };
    }

    async getStationStaffByStation(
        stationId: number,
        page: number = 1,
        limit: number = 10,
        search?: string,
        status?: boolean
    ): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        message: string;
    }> {
        const where: any = { stationId };
        if (typeof status === 'boolean') where.status = status;
        where.isHead = false;

        if (search) {
            where.user = { fullName: Like(`%${search}%`) };
        }

        const [data, total] = await this.stationStaffRepository.findAndCount({
            where,
            relations: ['user', 'station'],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' }
        });

        const mappedData = data.map(
            ({
                user,
                station,
                createdAt,
                updatedAt,
                userId,
                stationId,
                ...rest
            }) => ({
                ...rest,
                user: {
                    id: user.id,
                    fullName: user.fullName,
                    username: user.username
                },
                station: {
                    id: station.id,
                    name: station.name,
                    address: station.address
                }
            })
        );

        return {
            data: mappedData,
            total,
            page,
            limit,
            message: 'Lấy danh sách nhân viên của trạm thành công'
        };
    }

    async findByUserId(userId: number): Promise<StationStaff | null> {
        return await this.stationStaffRepository.findOne({
            where: { userId }
        });
    }

    async importStaffFromExcel(file: Express.Multer.File): Promise<{
        message: string;
        created: number;
        failed: Array<{ row: number; reason: string; data: any }>;
    }> {
        if (!file || !file.buffer) {
            throw new BadRequestException('File Excel không hợp lệ');
        }

        let workbook: XLSX.WorkBook;
        try {
            workbook = XLSX.read(file.buffer, { type: 'buffer' });
        } catch (err) {
            throw new BadRequestException('Không thể đọc file Excel');
        }

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (!rows || rows.length === 0) {
            throw new BadRequestException('File Excel không có dữ liệu');
        }

        const results = {
            created: 0,
            failed: [] as Array<{ row: number; reason: string; data: any }>
        };
        const emailsToSend: Array<{
            email: string;
            fullName: string;
            username: string;
            password: string;
            stationName: string;
        }> = [];

        // Helper function để lấy field từ row (case-insensitive)
        const getField = (obj: any, candidates: string[]): string => {
            // Loại bỏ dấu cách ở tên cột
            const lowerMap = Object.keys(obj).reduce(
                (acc, key) => {
                    acc[key.toLowerCase().trim()] = obj[key];
                    return acc;
                },
                {} as Record<string, any>
            );

            for (const candidate of candidates) {
                const lower = candidate.toLowerCase().trim();
                if (Object.prototype.hasOwnProperty.call(lowerMap, lower)) {
                    const value = lowerMap[lower];
                    if (value !== null && value !== undefined && value !== '') {
                        return String(value).trim();
                    }
                }
            }
            return '';
        };

        // Xử lý từng dòng
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowIndex = i + 2; // Giả sử header ở dòng 1

            const username = getField(row, [
                'username',
                'Username',
                'user',
                'taiKhoan',
                'Tài khoản'
            ]);
            const email = getField(row, ['email', 'Email', 'mail', 'Mail']);
            const fullName = getField(row, [
                'fullName',
                'fullname',
                'FullName',
                'hoTen',
                'Họ tên',
                'full_name'
            ]);
            const stationIdRaw = getField(row, [
                'stationId',
                'station_id',
                'StationId',
                'Trạm',
                'station',
                'maTram',
                'stationid'
            ]);

            // Validate các trường bắt buộc
            if (!username || username === '') {
                results.failed.push({
                    row: rowIndex,
                    reason: 'Thiếu username',
                    data: row
                });
                continue;
            }

            if (!email || email === '') {
                results.failed.push({
                    row: rowIndex,
                    reason: 'Thiếu email',
                    data: row
                });
                continue;
            }

            if (!fullName || fullName === '') {
                results.failed.push({
                    row: rowIndex,
                    reason: 'Thiếu fullName',
                    data: row
                });
                continue;
            }

            if (!stationIdRaw || stationIdRaw === '') {
                results.failed.push({
                    row: rowIndex,
                    reason: 'Thiếu stationId',
                    data: row
                });
                continue;
            }

            const stationId = Number(stationIdRaw);
            if (Number.isNaN(stationId) || stationId <= 0) {
                results.failed.push({
                    row: rowIndex,
                    reason: `stationId không hợp lệ: ${stationIdRaw}`,
                    data: row
                });
                continue;
            }

            try {
                // Xử lý từng dòng trong transaction riêng
                await this.dataSource.transaction(async (manager) => {
                    // 1. Kiểm tra station có tồn tại
                    const station = await manager.findOne(Station, {
                        where: { id: stationId }
                    });
                    if (!station) {
                        throw new NotFoundException(
                            `Trạm id=${stationId} không tồn tại`
                        );
                    }

                    // 2. Tạo mật khẩu random
                    const password = this.generateRandomPassword();

                    // 3. Tạo User thông qua UserService
                    const user = await this.userService.createStaffUser(
                        username,
                        email,
                        fullName,
                        password,
                        manager
                    );

                    // 4. Tạo StationStaff
                    const staff = manager.create(StationStaff, {
                        userId: user.id,
                        stationId: stationId,
                        status: true
                    });
                    await manager.save(StationStaff, staff);

                    // 5. Tạo History
                    const historyData = {
                        stationStaffId: staff.id,
                        stationId: stationId,
                        date: new Date(),
                        status: true
                    };
                    const staffHistory = manager.create(
                        StationStaffHistory,
                        historyData
                    );
                    await manager.save(StationStaffHistory, staffHistory);

                    // Chuẩn bị dữ liệu email
                    emailsToSend.push({
                        email: user.email,
                        fullName: user.fullName || fullName,
                        username,
                        password,
                        stationName: station.name
                    });
                });

                results.created++;
            } catch (error) {
                results.failed.push({
                    row: rowIndex,
                    reason: error?.message || 'Lỗi khi tạo tài khoản',
                    data: row
                });
            }
        }

        // Gửi email bất đồng bộ (không chặn response)
        for (const info of emailsToSend) {
            try {
                await this.mailService.sendStaffCredentials(
                    info.email,
                    info.fullName,
                    info.username,
                    info.password,
                    info.stationName
                );
            } catch (err) {
                console.error(
                    `[importStaffFromExcel] Gửi email tới ${info.email} thất bại:`,
                    err?.message || err
                );
            }
        }

        return {
            message: `Import hoàn tất. Tạo thành công ${results.created} tài khoản, lỗi ${results.failed.length} dòng`,
            created: results.created,
            failed: results.failed
        };
    }

    private generateRandomPassword(): string {
        return Math.random().toString(36).slice(-8);
    }

    async transferStation(
        transferDto: TransferStationDto
    ): Promise<{ message: string }> {
        try {
            return await this.dataSource.transaction(async (manager) => {
                // Kiểm tra user có phải staff không
                const staff = await manager.findOne(StationStaff, {
                    where: { userId: transferDto.userId, status: true },
                    relations: ['user', 'station']
                });

                if (!staff) {
                    throw new NotFoundException(
                        'User này không phải nhân viên trạm hoặc đã bị vô hiệu hóa'
                    );
                }

                const newStation = await manager.findOne(Station, {
                    where: { id: transferDto.newStationId }
                });

                if (!newStation) {
                    throw new NotFoundException('Trạm mới không tồn tại');
                }

                if (staff.stationId === transferDto.newStationId) {
                    throw new BadRequestException(
                        'Nhân viên đã thuộc trạm này rồi'
                    );
                }

                // Kiểm tra đã có lịch chuyển trạm chưa thực hiện
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const pendingHistory = await manager.findOne(
                    StationStaffHistory,
                    {
                        where: {
                            stationStaffId: staff.id,
                            status: false,
                            date: MoreThanOrEqual(today)
                        }
                    }
                );
                if (pendingHistory) {
                    throw new BadRequestException(
                        'Nhân viên này đã có lịch chuyển trạm chưa thực hiện hoặc đang chờ chuyển, không thể tạo thêm!'
                    );
                }

                const oldStationId = staff.stationId;

                // Xác định ngày chuyển trạm
                const transferDate = transferDto.date
                    ? new Date(transferDto.date)
                    : new Date();

                // Kiểm tra ngày không được trong quá khứ
                transferDate.setHours(0, 0, 0, 0);

                if (transferDate < today) {
                    throw new BadRequestException(
                        'Ngày chuyển trạm không được trong quá khứ'
                    );
                }

                // Kiểm tra ngày không được quá 3 ngày kể từ hiện tại
                const maxDate = new Date(today);
                maxDate.setDate(maxDate.getDate() + 3);

                if (transferDate > maxDate) {
                    throw new BadRequestException(
                        'Ngày chuyển trạm không được quá 3 ngày kể từ hiện tại'
                    );
                }

                const oldStation = staff.station;

                // Nếu là hôm nay, chuyển trạm ngay lập tức
                const isToday = transferDate.getTime() === today.getTime();
                if (isToday) {
                    await manager.update(
                        StationStaff,
                        { id: staff.id },
                        { stationId: transferDto.newStationId }
                    );
                }

                // Lưu lịch sử chuyển trạm
                const historyData = {
                    stationStaffId: staff.id,
                    stationId: transferDto.newStationId,
                    date: transferDate,
                    status: isToday
                };

                const staffHistory = manager.create(
                    StationStaffHistory,
                    historyData
                );
                await manager.save(StationStaffHistory, staffHistory);

                const message = isToday
                    ? `Chuyển nhân viên ${staff.user?.fullName || 'N/A'} từ trạm ${oldStationId} sang trạm ${transferDto.newStationId} thành công`
                    : `Đã lên lịch chuyển nhân viên ${staff.user?.fullName || 'N/A'} từ trạm ${oldStationId} sang trạm ${transferDto.newStationId} vào ngày ${transferDate.toLocaleDateString('en-CA')}`;

                try {
                    await this.mailService.sendTransferStationNotification(
                        staff.user.email,
                        staff.user.fullName || 'Nhân viên',
                        oldStation.id,
                        oldStation.name,
                        oldStation.address,
                        newStation.id,
                        newStation.name,
                        newStation.address,
                        transferDate.toLocaleDateString('vi-VN'),
                        isToday
                    );
                } catch (emailError) {
                    console.error(
                        '[transferStation] Gửi email thất bại:',
                        emailError?.message || emailError
                    );
                }

                return { message };
            });
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }
            console.log(error);
            throw new InternalServerErrorException(
                error?.message || 'Chuyển trạm cho nhân viên thất bại'
            );
        }
    }
}
