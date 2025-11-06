import { NumberRequired, StringRequired } from 'src/common/decorators';

export class CreateMessagePRMDto {
  @NumberRequired('ID nguoi chat')
  userId: number;
  @NumberRequired('ID phòng chat')
  roomId: number;
  @StringRequired('Nội dung')
  content: string;
}
