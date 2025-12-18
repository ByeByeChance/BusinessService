import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelEntity } from './entities/model.entity';
import { ModelCoreService } from './model-core.service';

@Module({
  imports: [TypeOrmModule.forFeature([ModelEntity])],
  providers: [ModelCoreService],
  exports: [ModelCoreService],
})
export class ModelCoreModule {}
