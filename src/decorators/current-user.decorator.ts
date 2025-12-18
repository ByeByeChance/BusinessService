import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 定义当前用户的数据类型
 */
export interface ICurrentUserType {
  id: string; // 账号id
  username: string; // 用户名
}

export const CurrentUser = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  if (data && request.user) {
    return request.user[data];
  } else {
    return request.user;
  }
});
