import { NumberRequired, StringNotRequired } from "src/common/decorators";

export class CreateReportDto {
    @NumberRequired('Chi tiết booking')
    bookingDetailId: number;

    @StringNotRequired('Mô tả báo cáo')
    description?: string;
}