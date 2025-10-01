import { StringRequired } from "src/common/decorators";
import { MinLength, MaxLength } from "class-validator";

export class LoginDto {
    @StringRequired('Tên đăng nhập hoặc email')
    usernameOrEmail: string;

    @StringRequired('Mật khẩu')
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    @MaxLength(32, { message: 'Mật khẩu tối đa 32 ký tự' })
    password: string;
}