import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { UserEntity } from '../user/entities/user.entity';
import { AccessTokenEntity } from '../user/entities/accessToken.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    RouterModule.register([
      {
        path: '', // 指定项目名称
        module: LoginModule,
      },
    ]),
    TypeOrmModule.forFeature([UserEntity, AccessTokenEntity]),
  ],
  controllers: [LoginController],
  providers: [LoginService],
})
export class LoginModule {}
