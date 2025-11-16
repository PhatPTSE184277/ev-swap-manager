import { IsString } from 'class-validator';
import { StringNotRequired } from 'src/common/decorators';

export class RejectRequestDto {
    @StringNotRequired('Ghi chú')
    note: string;
}