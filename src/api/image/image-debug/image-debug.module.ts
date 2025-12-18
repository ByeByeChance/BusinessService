import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DebugRecordEntity } from './entities/debugRecord.entity';
import { ImageDebugService } from './image-debug.service';
import { ImageCoreModule } from '../image-core/image-core.module';
import { SampleGroupEntity } from '../../sample/entities/sampleGroup.entity';
import { AlgorithmEntity } from '../../algorithm/entities/algorithm.entity';
import { ModelEntity } from '../../model/model-core/entities/model.entity';
import { ImageEntity } from '../image-core/entities/image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DebugRecordEntity,
      SampleGroupEntity,
      AlgorithmEntity,
      ModelEntity,
      ImageEntity,
    ]),
    ImageCoreModule,
  ],
  providers: [ImageDebugService],
  exports: [ImageDebugService],
})
export class ImageDebugModule {}
