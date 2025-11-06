import { StringRequired } from "src/common/decorators";
import { IsEmail } from "class-validator";

export class ResendVerificationDto {
    @StringRequired('Email')
    @IsEmail({}, { message: 'Email không đúng định dạng' })
    email: string;
}