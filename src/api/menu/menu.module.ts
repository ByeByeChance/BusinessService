import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { MenuEntity } from './entities/menu.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    RouterModule.register([
      {
        path: '', // 指定项目名称
        module: MenuModule,
      },
    ]),
    TypeOrmModule.forFeature([MenuEntity]),
  ],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
