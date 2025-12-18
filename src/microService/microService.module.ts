import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'DIMENSION_SERVICE',
        transport: Transport.TCP,
        options: {
          port: 9001,
        },
      },
      {
        name: 'LOG_SERVICE',
        transport: Transport.TCP,
        options: {
          port: 9002,
        },
      },
      {
        name: 'DECOMPRESS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 9003,
        },
      },
      {
        name: 'MERGE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 9004,
        },
      },
    ]),
  ],
  controllers: [],
  providers: [],
  exports: [ClientsModule],
})
export class MicroServiceModule {}
