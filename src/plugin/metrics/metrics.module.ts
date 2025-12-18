import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { DatabaseMetricsService } from './database-metrics.service';

@Module({
  imports: [PrometheusModule],
  providers: [DatabaseMetricsService],
  exports: [DatabaseMetricsService],
})
export class MetricsModule {}
