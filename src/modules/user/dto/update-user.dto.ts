import { IsOptional, MaxLength } from 'class-validator';
import { StringNotRequired } from 'src/common/decorators';

export class UpdateUserDto {
    @StringNotRequired('Họ và tên')
    fullName?: string;

    @StringNotRequired('Avatar')
    avatar?: string;
}