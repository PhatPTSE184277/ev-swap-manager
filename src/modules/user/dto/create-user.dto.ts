import { StringRequired } from "src/common/decorators";

export class CreateUserDto {
    @StringRequired('Tên đăng nhập')
    userName: string;

    @StringRequired('Mật khẩu')
    password: string;

    @StringRequired('Email')
    email: string;
}