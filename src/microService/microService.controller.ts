import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Controller()
export class MicroServiceController {
  constructor(
    @Inject('DIMENSION_SERVICE') private dimensionClient: ClientProxy,
    @Inject('LOG_SERVICE') private logClient: ClientProxy
  ) {}

  @Get('sum')
  dimension(@Query('num') str: string): Observable<number> {
    const numArr = str?.split(',')?.map((item) => parseInt(item)) || [];

    this.logClient.emit('log', {
      name: 'sum',
      service: 'DIMENSION_SERVICE',
      data: numArr,
      time: new Date().getTime(),
    });

    return this.dimensionClient.send<number>('sum', numArr);
  }
}
