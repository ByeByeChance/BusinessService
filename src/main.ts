import { NestFactory } from '@nestjs/core';
// import { VersioningType } from '@nestjs/common/enums';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common/services';
import { getConfig, IS_DEV } from './utils';
import { generateDocument } from './swagger';
import cluster from 'cluster';
import * as os from 'os';

const numCPUs = os.cpus().length;

async function bootstrap() {
  const config = getConfig();
  const PORT = config.PORT || 8088;
  const PREFIX = config.PREFIX || '/';

  const logger = new Logger('main.ts');
  const app = await NestFactory.create(AppModule, {
    logger: IS_DEV ? ['log', 'debug', 'error', 'warn'] : ['error', 'warn'],
  });

  //允许跨域请求
  app.enableCors();

  // 启动版本管理
  // app.enableVersioning({
  //   defaultVersion: '1', // 不指定默认版本为v1
  //   type: VersioningType.HEADER,
  //   header: 'api-version',
  // });

  // 给请求添加prefix
  app.setGlobalPrefix(PREFIX);

  // 全局异常过滤器和拦截器已在app.module.ts中注册

  // 创建swagger文档
  generateDocument(app);

  await app.listen(PORT, () => {
    logger.log(`进程 ${process.pid} 启动, 接口请访问: http://localhost:${PORT}/${PREFIX}`);
  });
}

// 仅在生产环境中使用cluster模块，开发环境禁用以避免与--watch模式冲突
if (IS_DEV) {
  // 开发环境直接启动应用
  bootstrap();
} else {
  // 生产环境配置Node.js进程集群
  if (cluster.isMaster) {
    const logger = new Logger('Cluster Master');
    logger.log(`主进程 ${process.pid} 正在运行`);
    logger.log(`系统CPU核心数: ${numCPUs}`);

    // 创建与CPU核心数相同的子进程
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    // 监听子进程退出事件，如果子进程异常退出，则重新创建
    cluster.on('exit', (worker, code, signal) => {
      logger.error(`子进程 ${worker.process.pid} 退出，退出码: ${code}, 信号: ${signal}`);
      logger.log('正在创建新的子进程...');
      cluster.fork();
    });
  } else {
    // 子进程执行应用启动
    bootstrap();
  }
}
