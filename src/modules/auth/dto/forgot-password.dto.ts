import { IsEmail, MaxLength } from 'class-validator';
import { StringRequired } from 'src/common/decorators';

export class ForgotPasswordDto {
    @StringRequired('Email')
    @IsEmail({}, { message: 'Email không đúng định dạng' })
    @MaxLength(100, { message: 'Email tối đa 100 ký tự' })
    email: string;
}
