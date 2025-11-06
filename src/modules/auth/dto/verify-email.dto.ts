import { StringRequired } from "src/common/decorators";

export class VerifyEmailDto {
    @StringRequired('Token')
    token: string;
}