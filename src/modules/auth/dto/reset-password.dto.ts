import { MaxLength, MinLength } from "class-validator";
import { StringRequired } from "src/common/decorators";

export class ResetPasswordDto {
    @StringRequired('Token')
    token: string;

    @StringRequired('Mật khẩu mới')
    @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
    @MaxLength(32, { message: 'Mật khẩu mới tối đa 32 ký tự' })
    newPassword: string;
}