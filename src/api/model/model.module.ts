import { Module } from '@nestjs/common';
import { ModelController } from './model.controller';
import { ModelService } from './model.service';
import { ModelCoreModule } from './model-core/model-core.module';
import { ModelTrainingModule } from './model-training/model-training.module';
import { ModelEvalModule } from './model-eval/model-eval.module';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    RouterModule.register([
      {
        path: '', // 指定项目名称
        module: ModelModule,
      },
    ]),
    ModelCoreModule,
    ModelTrainingModule,
    ModelEvalModule,
  ],
  controllers: [ModelController],
  providers: [ModelService],
})
export class ModelModule {}
