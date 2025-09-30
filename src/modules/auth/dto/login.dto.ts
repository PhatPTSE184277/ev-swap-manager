import { StringRequired } from "src/common/decorators";

export class LoginDto {
    @StringRequired('Tên đăng nhập hoặc email')
    usernameOrEmail: string;

    @StringRequired('Mật khẩu')
    password: string;
}