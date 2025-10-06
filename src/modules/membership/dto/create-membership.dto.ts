import { StringRequired, NumberRequired } from 'src/common/decorators';

export class CreateMembershipDto {
    @StringRequired('Tên gói')
    name: string;

    @StringRequired('Mô tả')
    description: string;

    @NumberRequired('Giá')
    price: number;

    @NumberRequired('Thời hạn (ngày)')
    duration: number;
}