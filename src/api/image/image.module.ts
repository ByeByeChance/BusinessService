import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { ImageCoreModule } from './image-core/image-core.module';
import { ImageDebugModule } from './image-debug/image-debug.module';

@Module({
  imports: [ImageCoreModule, ImageDebugModule],
  controllers: [ImageController],
  providers: [ImageService],
})
export class ImageModule {}
