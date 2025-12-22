import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { ImageCoreModule } from './image-core/image-core.module';
import { ImageDebugModule } from './image-debug/image-debug.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [ImageCoreModule, ImageDebugModule, UserModule],
  controllers: [ImageController],
  providers: [ImageService],
})
export class ImageModule {}
