import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageEntity } from './entities/image.entity';
import { ImageCoreService } from './image-core.service';
import { ResourceEntity } from '../../resource/entities/resource.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ImageEntity, ResourceEntity])],
  providers: [ImageCoreService],
  exports: [ImageCoreService],
})
export class ImageCoreModule {}
