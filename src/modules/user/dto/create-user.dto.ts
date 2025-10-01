import { StringRequired } from "src/common/decorators";
import { IsEmail, Matches, MinLength, MaxLength } from "class-validator";

export class CreateUserDto {
    @StringRequired('Tên đăng nhập')
    @MinLength(4, { message: 'Tên đăng nhập phải có ít nhất 4 ký tự' })
    @MaxLength(32, { message: 'Tên đăng nhập tối đa 32 ký tự' })
    @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Tên đăng nhập chỉ được chứa chữ, số và dấu gạch dưới' })
    username: string;

    @StringRequired('Mật khẩu')
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    @MaxLength(32, { message: 'Mật khẩu tối đa 32 ký tự' })
    password: string;

    @StringRequired('Email')
    @IsEmail({}, { message: 'Email không đúng định dạng' })
    @MaxLength(100, { message: 'Email tối đa 100 ký tự' })
    email: string;
}