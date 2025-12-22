import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserEntity } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from '@src/api/role/entities/role.entity';

@Module({
  imports: [
    RouterModule.register([
      {
        path: '', // 指定项目名称
        module: UserModule,
      },
    ]),
    TypeOrmModule.forFeature([UserEntity, RoleEntity]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [TypeOrmModule],
})
export class UserModule {}
