import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvalRecordEntity } from './entities/evalRecord.entity';
import { ModelEvalService } from './model-eval.service';
import { DebugRecordEntity } from '../../image/image-debug/entities/debugRecord.entity';
import { SampleGroupEntity } from '../../sample/entities/sampleGroup.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EvalRecordEntity, DebugRecordEntity, SampleGroupEntity])],
  providers: [ModelEvalService],
  exports: [ModelEvalService],
})
export class ModelEvalModule {}
