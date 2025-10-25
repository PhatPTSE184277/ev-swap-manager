import { NumberRequired, StringRequired } from 'src/common/decorators';

export class CreateMessageDto {
  @NumberRequired('ID phòng chat')
  roomId: number;
  @StringRequired('Nội dung')
  content: string;
}
