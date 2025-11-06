import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ApproveQrDto {
  @ApiProperty({
    example: 'ea9ee24f-ada8-4c59-b9eb-223f8f54bc45',
    description: 'Mã sessionId của QR login',
  })
  @IsString()
  @IsNotEmpty()
  sessionId: string;
}
