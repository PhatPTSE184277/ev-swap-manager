import { Module } from '@nestjs/common';
import { CabinetService } from './cabinet.service';
import { CabinetController } from './cabinet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cabinet, Slot } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Cabinet, Slot])],
  controllers: [CabinetController],
  providers: [CabinetService],
})
export class CabinetModule {}
