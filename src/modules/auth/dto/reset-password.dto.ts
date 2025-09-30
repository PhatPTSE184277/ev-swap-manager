import { StringRequired } from "src/common/decorators";

export class ResetPasswordDto {
    @StringRequired('Token')
    token: string;

    @StringRequired('Mật khẩu mới')
    newPassword: string;
}