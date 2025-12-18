import {
  CanActivate,
  ExecutionContext,
  // HttpException,
  // HttpStatus,
  Injectable,
} from '@nestjs/common';

// import { getUrlQuery } from '@src/utils';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 测试环境：允许无token访问，直接设置模拟用户
    // 在生产环境中需要移除这部分代码
    request.user = {
      id: 'test_user_id',
      username: 'test_user',
      role: {
        name: 'admin', // 管理员角色
      },
    };
    return true;

    /*
    // 原始认证逻辑（暂时注释）
    // 从Authorization头获取Bearer token
    let token = request.headers.authorization;
    if (token && token.startsWith('Bearer ')) {
      token = token.substring(7);
    } else {
      // 从其他位置获取token
      token = context.switchToRpc().getData().headers.token || context.switchToHttp().getRequest().body.token || getUrlQuery(request.url, 'token');
    }
    console.log(token, '当前token----');
    if (token) {
      // 如果传递了token的话就要从redis中查询是否有该token
      const result = await this.redisService.get<{ id: string; username: string }>(token);
      if (result && result.id && result.username) {
        request.user = result;
        return true;
      } else {
        throw new HttpException(
          JSON.stringify({ code: 10024, message: '你还没登录,请先登录' }),
          HttpStatus.OK
        );
      }
    } else {
      throw new HttpException(
        JSON.stringify({ code: 10024, message: '你还没登录,请先登录' }),
        HttpStatus.OK
      );
    }
    */
  }
}
