import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@src/api/user/entities/user.entity';
import { RoleEntity } from '@src/api/role/entities/role.entity';
import { InitDbService } from './services/init-db.service';

@Global()
@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([UserEntity, RoleEntity])],
  providers: [InitDbService],
})
export class SharedModule {}
