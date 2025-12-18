import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Counter, Histogram } from 'prom-client';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  private readonly httpRequestCounter: Counter<string>;
  private readonly httpResponseTimeHistogram: Histogram<string>;
  private readonly httpResponseSizeHistogram: Histogram<string>;

  constructor() {
    // 请求计数器
    this.httpRequestCounter = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status', 'environment'],
    });

    // 响应时间直方图
    this.httpResponseTimeHistogram = new Histogram({
      name: 'http_response_time_seconds',
      help: 'HTTP response time in seconds',
      labelNames: ['method', 'path', 'status', 'environment'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    });

    // 响应大小直方图
    this.httpResponseSizeHistogram = new Histogram({
      name: 'http_response_size_bytes',
      help: 'HTTP response size in bytes',
      labelNames: ['method', 'path', 'status', 'environment'],
      buckets: [10, 100, 1000, 10000, 100000, 1000000],
    });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, path } = request;
    const startTime = Date.now();
    const environment = process.env.RUNNING_ENV || 'dev';

    return next.handle().pipe(
      tap((data) => {
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        const status = response.statusCode;
        const responseSize = JSON.stringify(data).length;

        // 记录指标
        this.httpRequestCounter.labels(method, path, status, environment).inc();
        this.httpResponseTimeHistogram.labels(method, path, status, environment).observe(duration);
        this.httpResponseSizeHistogram
          .labels(method, path, status, environment)
          .observe(responseSize);
      })
    );
  }
}
