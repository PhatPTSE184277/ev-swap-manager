import { StringNotRequired, StringRequired } from "src/common/decorators";

export class CreateBatteryTypeDto {
    @StringRequired('Tên loại pin')
    name: string;

    @StringNotRequired('Mô tả loại pin')
    description?: string;
}