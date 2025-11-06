import { StringRequired } from 'src/common/decorators';

export class ChangePasswordDto {
    @StringRequired('Mật khẩu hiện tại')
    currentPassword: string;

    @StringRequired('Mật khẩu mới', 6, 32)
    newPassword: string;
}
