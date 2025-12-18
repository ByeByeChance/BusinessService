import { AccessTokenEntity } from '@src/api/user/entities/accessToken.entity';

export class LoginVo {
  readonly id!: string; // 账号id
  readonly username?: string; // 用户名
  readonly token?: string; // 登录的token
  readonly refreshToken?: string; // 刷新token
}

export class LoginUserVo {
  readonly id!: string; // 账号id
  readonly username!: string; // 用户名
  readonly status!: number; // 状态：1是正常, 0是禁用
  readonly password!: string; // 密码
  readonly salt!: string; // 密码盐
}

export class LoginTokenDataVo {
  readonly userInfo!: LoginUserVo; // 用户基本信息
  readonly token!: string; // 登录的token
  readonly authApi!: Pick<AccessTokenEntity, 'token' | 'refreshToken' | 'expirationTime'>[];
}
