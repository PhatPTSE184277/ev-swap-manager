import { StringRequired } from "src/common/decorators";

export class ForgotPasswordDto {
    @StringRequired('Email')
    email: string;
}