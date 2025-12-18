import { Module } from '@nestjs/common';
import { LoginModule } from './login/login.module';
import { UserModule } from './user/user.module';
import { MenuModule } from './menu/menu.module';
import { RoleModule } from './role/role.module';
import { AlgorithmModule } from './algorithm/algorithm.module';
import { SampleModule } from './sample/sample.module';
import { ImageModule } from './image/image.module';
import { ModelModule } from './model/model.module';
import { ResourceModule } from './resource/resource.module';

@Module({
  imports: [
    LoginModule,
    UserModule,
    MenuModule,
    RoleModule,
    AlgorithmModule,
    SampleModule,
    ImageModule,
    ModelModule,
    ResourceModule,
  ],
  controllers: [],
  providers: [],
})
export class ApiModule {}
