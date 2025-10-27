import { NumberRequired, StringRequired } from "src/common/decorators";

export class UpdateFeedbackDto {
    @StringRequired("Nội dung phản hồi không được để trống")
    content?: string;

    @NumberRequired("Đánh giá không được để trống")
    rating?: number;
}