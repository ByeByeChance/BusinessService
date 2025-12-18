import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis, { ClientContext, Result } from 'ioredis';
import { getConfig } from '../../utils/config';
import { ObjectType } from '@src/types';
import { isObject } from '@src/utils';

@Injectable()
export class RedisService implements OnModuleInit {
  private redisClient!: Redis;

  async onModuleInit() {
    try {
      const config = getConfig();
      const redisConfig = config.redis || {};

      const port = redisConfig.port || 6379;
      const host = redisConfig.host || 'localhost';
      const username = redisConfig.username || '';
      const password = redisConfig.password || '';
      const db = redisConfig.db || 0;

      this.redisClient = new Redis({
        port,
        host,
        username,
        password,
        db,
        // 连接池配置
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        // 连接池大小
        connectionName: 'algorithm-platform-service',
        // 超时设置
        connectTimeout: 10000,
        // 保持连接
        keepAlive: 30000,
        // 禁用Nagle算法
        noDelay: true,
      });

      await this.redisClient.ping();
      console.log('Redis连接成功');
    } catch (error) {
      console.warn('Redis连接失败，将在需要时自动重试:', error);
      // 不抛出错误，允许应用继续运行
    }
  }

  /**
   * @Description: 设置值到redis中
   * @param {string} key
   * @param {any} value
   * @param {number} second 过期时间秒
   * @return {*}
   */
  public async set(key: string, value: unknown): Promise<Result<'OK', ClientContext>>;
  public async set(
    key: string,
    value: unknown,
    second: number
  ): Promise<Result<'OK', ClientContext>>;
  public async set(key: string, value: any, second?: number): Promise<Result<'OK', ClientContext>> {
    value = isObject(value) ? JSON.stringify(value) : value;
    if (!second) {
      return await this.redisClient.set(key, value);
    } else {
      return await this.redisClient.set(key, value, 'EX', second);
    }
  }

  /**
   * @Description: 设置自动 +1
   * @param {string} key
   * @return {*}
   */
  public async incr(key: string): Promise<number> {
    return await this.redisClient.incr(key);
  }

  /**
   * @Description: 设置自动 -1
   * @param {string} key
   * @return {*}
   */
  public async decr(key: string): Promise<number> {
    return await this.redisClient.decr(key);
  }

  /**
   * @Description: 设置获取redis缓存中的值
   * @param key {String}
   */
  public async get<T = any>(key: string): Promise<T | null> {
    try {
      const data = await this.redisClient.get(key);
      if (data) {
        return JSON.parse(data) as T;
      } else {
        return null;
      }
    } catch (e) {
      return (await this.redisClient.get(key)) as unknown as T | null;
    }
  }

  /**
   * @Description: 根据key删除redis缓存数据
   * @param {string} key
   * @return {*}
   */
  public async del(key: string): Promise<Result<number, ClientContext>> {
    return await this.redisClient.del(key);
  }

  async hset(key: string, field: ObjectType): Promise<Result<number, ClientContext>> {
    return await this.redisClient.hset(key, field);
  }

  /**
   * @Description: 获取单一个值
   * @param {string} key
   * @param {string} field
   * @return {*}
   */
  async hget(key: string, field: string): Promise<Result<string | null, ClientContext>> {
    return await this.redisClient.hget(key, field);
  }

  /**
   * @Description: 获取全部的hget的
   * @param {string} key
   * @return {*}
   */
  async hgetall(key: string): Promise<Result<Record<string, string>, ClientContext>> {
    return await this.redisClient.hgetall(key);
  }

  /**
   * @Description: 清空redis的缓存
   * @return {*}
   */
  public async flushall(): Promise<Result<'OK', ClientContext>> {
    return await this.redisClient.flushall();
  }

  /**
   * @Description: 执行Redis Lua脚本
   * @param {string} script Lua脚本
   * @param {number} keys 键的数量
   * @param {any[]} args 参数列表
   * @return {*}
   */
  public async eval(script: string, keys: number, ...args: any[]): Promise<any> {
    return await this.redisClient.eval(script, keys, ...args);
  }
}
