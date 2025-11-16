import { Module } from '@nestjs/common';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request } from 'src/entities/request.entity';
import { GatewaysModule } from 'src/gateways/gateways.module';
import { RequestDetail } from 'src/entities/request-detail.entity';
import { Battery } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Request, RequestDetail, Battery]), GatewaysModule],
  controllers: [RequestController],
  providers: [RequestService],
})
export class RequestModule {}
