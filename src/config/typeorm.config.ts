import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as entities from '../entities';

export const typeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: (configService.get<string>('DB_DIALECT') as any) || 'mysql',
  host: configService.get<string>('DB_HOST'),
  port: Number(configService.get<string>('DB_PORT')) || 3306,
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  entities: Object.values(entities),
  synchronize: true,
  logging: false,
  autoLoadEntities: true,
});