import { IsUUID } from 'class-validator';

export class ApproveQrDto {
  @IsUUID()
  sessionId: string;
}
