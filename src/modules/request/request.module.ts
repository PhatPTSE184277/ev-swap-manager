import { Module } from '@nestjs/common';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request } from 'src/entities/request.entity';
import { GatewaysModule } from 'src/gateways/gateways.module';

@Module({
  imports: [TypeOrmModule.forFeature([Request]), GatewaysModule],
  controllers: [RequestController],
  providers: [RequestService],
})
export class RequestModule {}
