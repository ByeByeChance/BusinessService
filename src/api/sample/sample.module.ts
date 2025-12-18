import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SampleController } from './sample.controller';
import { SampleService } from './sample.service';
import { SampleGroupEntity } from './entities/sampleGroup.entity';
import { SampleEntity } from './entities/sample.entity';
import { ResourceEntity } from '../resource/entities/resource.entity';
import { UserEntity } from '../user/entities/user.entity';

@Module({
  imports: [
    RouterModule.register([
      {
        path: '',
        module: SampleModule,
      },
    ]),
    TypeOrmModule.forFeature([SampleGroupEntity, SampleEntity, ResourceEntity, UserEntity]),
  ],
  controllers: [SampleController],
  providers: [SampleService],
})
export class SampleModule {}
