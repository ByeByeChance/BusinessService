import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { AlgorithmController } from './algorithm.controller';
import { AlgorithmService } from './algorithm.service';
import { AlgorithmEntity } from './entities/algorithm.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: '', // 指定项目名称
        module: AlgorithmModule,
      },
    ]),
    TypeOrmModule.forFeature([AlgorithmEntity]),
    UserModule,
  ],
  controllers: [AlgorithmController],
  providers: [AlgorithmService],
})
export class AlgorithmModule {}
