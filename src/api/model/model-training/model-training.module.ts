import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingRecordEntity } from './entities/trainingRecord.entity';
import { ModelTrainingService } from './model-training.service';
import { DebugRecordEntity } from '../../image/image-debug/entities/debugRecord.entity';
import { SampleGroupEntity } from '../../sample/entities/sampleGroup.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingRecordEntity, DebugRecordEntity, SampleGroupEntity])],
  providers: [ModelTrainingService],
  exports: [ModelTrainingService],
})
export class ModelTrainingModule {}
