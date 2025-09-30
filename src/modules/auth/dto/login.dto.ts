import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Tên tài khoản hoặc email không được để trống' })
  @IsString({ message: 'Tên tài khoản hoặc email phải là một chuỗi' })
  account: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'Mật khẩu phải là một chuỗi' })
  password: string;
}