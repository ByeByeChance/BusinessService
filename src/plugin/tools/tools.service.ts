import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { TOKEN_PREFIX, TOKEN_REFRESH_PREFIX } from '@src/constants';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ToolsService {
  /**
   * @Description: 创建一个生成uuid的方法
   * @return {*}
   */
  get uuidToken(): string {
    return uuidv4().replace(/-/g, '');
  }

  /**
   * @Description: 获取当前ip地址
   * @param {Request} req
   * @return {*}
   */
  getReqIP(req: Request): string {
    const currentIp =
      ((req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress)?.replace(
        '::ffff:',
        ''
      ) ?? '';
    // 处理代理后的多个ip地址,只拿第一个ip
    if (currentIp.split(',').length) {
      return currentIp.split(',')[0];
    } else {
      return currentIp;
    }
  }

  /**
   * @Description: 密码加密
   * @param {string} password 原始密码
   * @return {*}
   */
  async makePassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * @Description: 验证密码
   * @param {string} password 原始密码
   * @param {string} hashedPassword 加密后的密码
   * @return {*}
   */
  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * @Description: 登录token的key
   * @param {number} userId
   * @return {*}
   */
  generateLoginTokenKey(userId: number): string {
    return `${TOKEN_PREFIX}_${userId}`;
  }
  /**
   * @Description: 刷新token的key
   * @param {number} userId
   * @return {*}
   */
  generateLoginRefreshTokenKey(userId: number): string {
    return `${TOKEN_REFRESH_PREFIX}_${userId}`;
  }
}
