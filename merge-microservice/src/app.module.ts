import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MergeController } from './merge.controller';
import { MergeService } from './merge.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, MergeController],
  providers: [AppService, MergeService],
})
export class AppModule {}
