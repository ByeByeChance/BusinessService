import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MinioModule } from 'nestjs-minio-client';
import { MinioClientService } from './minioClient.service';
import { MinioClientController } from './minioClient.controller';

@Module({
  imports: [
    MinioModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          endPoint: String(configService.get('MINIO_CONFIG.MINIO_ENDPOINT')),
          port: Number.parseInt(configService.get('MINIO_CONFIG.MINIO_PORT') ?? '31397'),
          useSSL: false,
          accessKey: String(configService.get('MINIO_CONFIG.MINIO_ACCESSKEY')),
          secretKey: String(configService.get('MINIO_CONFIG.MINIO_SECRETKEY')),
        };
      },
    }),
  ],
  controllers: [MinioClientController],
  providers: [MinioClientService],
  exports: [MinioClientService],
})
export class MinioClientModule {}
