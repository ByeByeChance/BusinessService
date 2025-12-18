import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceEntity } from './entities/resource.entity';
import { ResourceService } from './resource.service';
import { ResourceController } from './resource.controller';
import { MinioClientModule } from '@src/minioClient/minioClient.module';
import { MicroServiceModule } from '@src/microService/microService.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ResourceEntity]),
    MinioClientModule,
    MicroServiceModule,
    UserModule,
  ],
  controllers: [ResourceController],
  providers: [ResourceService],
  exports: [ResourceService],
})
export class ResourceModule {}
