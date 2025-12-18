import { Module } from '@nestjs/common';
import { DecompressController } from './decompress.controller';
import { DecompressService } from './decompress.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [DecompressController],
  providers: [DecompressService],
})
export class AppModule {}
