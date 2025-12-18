import { Injectable, OnModuleInit } from '@nestjs/common';
import { Counter, Gauge, Histogram } from 'prom-client';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Injectable()
export class DatabaseMetricsService implements OnModuleInit {
  private readonly dbConnectionGauge: Gauge<string>;
  private readonly dbQueryCounter: Counter<string>;
  private readonly dbQueryTimeHistogram: Histogram<string>;

  constructor(@InjectConnection() private readonly connection: Connection) {
    // 数据库连接池指标
    this.dbConnectionGauge = new Gauge({
      name: 'database_connections',
      help: 'Number of database connections in pool',
      labelNames: ['status', 'environment'],
    });

    // 数据库查询计数器
    this.dbQueryCounter = new Counter({
      name: 'database_queries_total',
      help: 'Total number of database queries',
      labelNames: ['operation', 'success', 'environment'],
    });

    // 数据库查询时间直方图
    this.dbQueryTimeHistogram = new Histogram({
      name: 'database_query_time_seconds',
      help: 'Database query time in seconds',
      labelNames: ['operation', 'success', 'environment'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    });
  }

  onModuleInit() {
    // 定期收集数据库连接池指标
    setInterval(() => {
      this.updateConnectionMetrics();
    }, 5000); // 每5秒更新一次

    // 注册查询监听器
    this.registerQueryListener();
  }

  private updateConnectionMetrics() {
    const environment = process.env.RUNNING_ENV || 'dev';

    try {
      // 尝试获取MySQL连接池信息
      const mysqlDriver = this.connection.driver as any;
      const pool = mysqlDriver.pool || mysqlDriver._pool;

      if (pool) {
        // 更新连接池指标
        const totalConnections = pool.config?.connectionLimit || 0;

        // 注意：不同MySQL驱动版本的连接池属性可能不同
        const usedConnections = pool._allConnections?.length || 0;
        const idleConnections = pool._freeConnections?.length || 0;
        const pendingConnections = pool._connectionQueue?.length || 0;

        this.dbConnectionGauge.labels('used', environment).set(usedConnections);
        this.dbConnectionGauge.labels('idle', environment).set(idleConnections);
        this.dbConnectionGauge.labels('pending', environment).set(pendingConnections);
        this.dbConnectionGauge.labels('total', environment).set(totalConnections);
      }
    } catch (error) {
      // 如果获取连接池信息失败，记录错误但不影响其他功能
      console.error('Failed to update database connection metrics:', error);
    }
  }

  private registerQueryListener() {
    // 注意：TypeORM 0.3.x版本的查询监听方式与0.2.x不同
    // 可以使用事件监听或中间件的方式记录查询指标
    // 这里暂时不实现具体的查询监听逻辑
  }

  // 手动记录查询指标的方法
  public recordQuery(operation: string, success: boolean, duration: number) {
    const environment = process.env.RUNNING_ENV || 'dev';
    this.dbQueryCounter.labels(operation, success.toString(), environment).inc();
    this.dbQueryTimeHistogram
      .labels(operation, success.toString(), environment)
      .observe(duration / 1000);
  }
}
