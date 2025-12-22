import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConfig } from './utils';
import * as os from 'os';
import { ApiModule } from './api/api.module';
import { UserModule } from './api/user/user.module';
import { MicroServiceModule } from './microService/microService.module';
import { MinioClientModule } from './minioClient/minioClient.module';
import { PluginModule } from './plugin/plugin.module';
import { SharedModule } from './shared/shared.module';
import { ValidationPipe } from './pipe/validation.pipe';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ApiInterceptor } from './interceptors/api.interceptor';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { LoggerInterceptor } from './interceptors/logger.interceptor';
// Prometheus监控
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { HttpMetricsInterceptor } from './interceptors/http-metrics.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: false, // 忽视默认读取.env的文件配置
      isGlobal: true, // 全局注入
      load: [getConfig], // 加载配置文件
    }),
    // Prometheus监控配置
    PrometheusModule.register({
      path: '/metrics', // 监控端点
      defaultLabels: {
        app: 'algorithm-platform-service',
        environment: process.env.RUNNING_ENV || 'dev',
      },
    }),
    // mysql的连接
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: String(configService.get('datasource.host')),
        port: Number.parseInt(configService.get('datasource.port') ?? '3306'),
        username: String(configService.get('datasource.username')),
        password: String(configService.get('datasource.password')),
        database: String(configService.get('datasource.database')),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        logging: configService.get('datasource.logging'),
        timezone: '+08:00', // 东八区
        synchronize: configService.get('datasource.synchronize') ?? false, // 自动创建表结构
        cache: {
          duration: 60000, // 1分钟的缓存
        },
        autoLoadEntities: true, // 自动加载所有通过TypeOrmModule.forFeature()注册的实体
        subscribers: [],
        migrations: [],
        cli: {
          entitiesDir: 'src/**/*.entity.ts',
          migrationsDir: 'src/migrations',
          subscribersDir: 'src/subscribers',
        },
        extra: {
          // 根据CPU核心数动态调整连接池大小
          poolMax: Math.max(32, Math.min(64, os.cpus().length * 4)),
          poolMin: Math.max(16, Math.min(32, os.cpus().length * 2)),
          queueTimeout: 30000, // 连接队列超时时间调整为30秒
          pollPingInterval: 30, // 每隔30秒检查连接有效性
          pollTimeout: 60, // 连接有效60秒
          acquireTimeout: 10000, // 获取连接超时时间
          waitForConnections: true, // 当连接池满时等待可用连接
          connectionLimit: Math.max(32, Math.min(64, os.cpus().length * 4)), // 与poolMax保持一致
        },
      }),
    }),
    ApiModule,
    UserModule,
    MicroServiceModule,
    MinioClientModule,
    PluginModule,
    SharedModule,
  ],
  providers: [
    Logger,
    // 全局使用管道(数据校验)
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    // 全局使用过滤器
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // 全局接口成功返回数据封装
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiInterceptor,
    },
    // 全局响应转换拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    // 全局日志拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
    // 全局HTTP指标拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpMetricsInterceptor,
    },
  ],
})
export class AppModule {}
