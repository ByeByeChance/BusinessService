import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { RedisService } from '@src/plugin/redis/redis.service';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('未获取到token，请重新登录');
    }
    try {
      const result = await this.redisService.get<{ id: string; username: string }>(token);
      if (result && result.id && result.username) {
        request.user = result;
      } else {
        throw new UnauthorizedException('未获取到用户信息，请重新登录');
      }
    } catch {
      throw new UnauthorizedException('未获取到token，请重新登录');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
