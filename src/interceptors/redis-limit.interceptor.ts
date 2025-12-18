import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { ICurrentUserType } from '@src/decorators';

import {
  REDIS_LIMIT_RANGE_SECOND_KEY,
  REDIS_LIMIT_KEY,
  REDIS_LIMIT_MAX_REQUEST_KEY,
} from '@src/constants';
import { RedisService } from '@src/plugin/redis/redis.service';
import { ToolsService } from '@src/plugin/tools/tools.service';

type IRequest = Request & { user: ICurrentUserType };

@Injectable()
export class RedisLimitInterceptor implements NestInterceptor {
  constructor(
    private readonly redisService: RedisService,
    private readonly toolsService: ToolsService
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const request: IRequest = context.switchToHttp().getRequest();

    // 是否需要限流
    const isLimitApi =
      Reflect.getMetadata(REDIS_LIMIT_KEY, context.getHandler()) ||
      Reflect.getMetadata(REDIS_LIMIT_KEY, context.getClass());

    if (!isLimitApi) {
      return next.handle();
    }

    // 获取限流参数
    const redisRangeSecond =
      Reflect.getMetadata(REDIS_LIMIT_RANGE_SECOND_KEY, context.getHandler()) ||
      Reflect.getMetadata(REDIS_LIMIT_RANGE_SECOND_KEY, context.getClass());

    const redisMaxRequest =
      Reflect.getMetadata(REDIS_LIMIT_MAX_REQUEST_KEY, context.getHandler()) ||
      Reflect.getMetadata(REDIS_LIMIT_MAX_REQUEST_KEY, context.getClass());

    // 生成限流key，包含IP和接口路径，支持更精细的限流
    const currentIp = this.toolsService.getReqIP(request);
    const path = request.path;
    const redisKey = `redis_limit:${currentIp}:${path}`;

    try {
      // 使用滑动窗口算法实现更精确的限流
      const currentTime = Date.now();
      const windowStart = currentTime - redisRangeSecond * 1000;

      // 执行Redis Lua脚本实现原子操作，避免并发问题
      const script = `
        -- 移除窗口外的请求记录
        redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, ARGV[1])

        -- 获取当前窗口内的请求数量
        local currentCount = redis.call('ZCARD', KEYS[1])

        -- 检查是否超过限制
        if currentCount >= tonumber(ARGV[2]) then
          return {currentCount, false}
        end

        -- 添加当前请求记录
        redis.call('ZADD', KEYS[1], ARGV[3], ARGV[3])

        -- 设置过期时间，避免内存泄漏
        redis.call('EXPIRE', KEYS[1], ARGV[4])

        return {currentCount + 1, true}
      `;

      // 调用Redis脚本
      const result = await this.redisService.eval(
        script,
        1,
        redisKey,
        windowStart.toString(),
        redisMaxRequest.toString(),
        currentTime.toString(),
        redisRangeSecond.toString()
      );

      const [count, allowed] = result;

      if (!allowed) {
        throw new HttpException(
          `访问过于频繁，请稍后重试。当前${redisRangeSecond}秒内已请求${count}次，限制${redisMaxRequest}次。`,
          HttpStatus.TOO_MANY_REQUESTS
        );
      }

      return next.handle();
    } catch (error) {
      // 处理Redis错误，避免因Redis问题导致整个服务不可用
      console.error('Redis限流操作失败:', error);
      // 在Redis不可用时，暂时允许请求通过，避免级联故障
      return next.handle();
    }
  }
}
