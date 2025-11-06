import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role, StationStaff, User } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, StationStaff])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
