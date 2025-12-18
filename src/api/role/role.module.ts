import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { RoleEntity } from './entities/role.entity';
import { MenuEntity } from '@src/api/menu/entities/menu.entity';
import { UserEntity } from '@src/api/user/entities/user.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: '',
        module: RoleModule,
      },
    ]),
    TypeOrmModule.forFeature([RoleEntity, MenuEntity, UserEntity]),
    UserModule,
  ],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
