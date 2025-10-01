import { IsOptional, MaxLength } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @MaxLength(100, { message: 'Họ tên tối đa 100 ký tự' })
    fullName?: string;

    @IsOptional()
    @MaxLength(255, { message: 'Avatar tối đa 255 ký tự' })
    avatar?: string;
}