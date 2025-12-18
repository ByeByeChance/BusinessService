import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoginDto, LogoutDto } from './dto/login.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { AccessTokenEntity } from '../user/entities/accessToken.entity';
import { ToolsService } from '@src/plugin/tools/tools.service';
import { LoginVo } from './vo/login.vo';
import dayjs from 'dayjs';
import { getConfig } from '@src/utils/config';
import { RedisService } from '@src/plugin/redis/redis.service';

@Injectable()
export class LoginService {
  private readonly config = getConfig();
  private readonly refreshTokenExpire = this.config.refreshTokenExpire || 7;
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(AccessTokenEntity)
    private readonly accessTokenRepository: Repository<AccessTokenEntity>,
    private readonly toolsService: ToolsService,
    private readonly redisService: RedisService
  ) {}

  /**
   * @Description: 登录操作
   * @param {LoginDto} req
   * @return {*}
   */
  async loginApi(req: LoginDto): Promise<LoginVo | null> {
    const { username, password } = req;
    const userEntity: UserEntity | null = await this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username })
      .getOne();
    let data: LoginVo | null = null;
    if (userEntity) {
      const isPasswordValid = await this.toolsService.validatePassword(
        password,
        userEntity.password
      );
      if (isPasswordValid) {
        const accessTokenEntity: AccessTokenEntity | null = await this.accessTokenRepository
          .createQueryBuilder('accessToken')
          .where('accessToken.userId = :userId', { userId: userEntity.id })
          .getOne();
        if (accessTokenEntity) {
          // 判断token是否过期
          if (dayjs().isAfter(accessTokenEntity.expirationTime)) {
            // token过期了，重新生成
            const { token, refreshToken, expirationTime } = this.createToken();
            await this.accessTokenRepository.update(accessTokenEntity.id, {
              token,
              refreshToken,
              expirationTime,
            });
            // 将用户信息存储到Redis中
            await this.redisService.set(token, {
              id: userEntity.id,
              username: userEntity.username,
            });
            data = {
              id: userEntity.id,
              username: userEntity.username,
              token,
              refreshToken,
            };
          } else {
            // 确保token在Redis中存在
            const redisToken = await this.redisService.get(accessTokenEntity.token);
            if (!redisToken) {
              await this.redisService.set(accessTokenEntity.token, {
                id: userEntity.id,
                username: userEntity.username,
              });
            }
            data = {
              id: userEntity.id,
              username: userEntity.username,
              token: accessTokenEntity.token,
              refreshToken: accessTokenEntity.refreshToken,
            };
          }
        } else {
          const { token, refreshToken, expirationTime } = this.createToken();
          const newTokenData = this.accessTokenRepository.create({
            userId: userEntity.id,
            token,
            refreshToken,
            expirationTime,
          });
          await this.accessTokenRepository.save(newTokenData);
          // 将用户信息存储到Redis中
          await this.redisService.set(token, {
            id: userEntity.id,
            username: userEntity.username,
          });
          data = {
            id: userEntity.id,
            username: userEntity.username,
            token,
            refreshToken,
          };
        }
        // 登录成功，更新上次登录时间
        this.userRepository.update(userEntity.id, {
          lastLoginDate: new Date(),
        });
      } else {
        throw new HttpException(`密码错误`, HttpStatus.BAD_REQUEST);
      }
    } else {
      throw new HttpException(`用户不存在`, HttpStatus.BAD_REQUEST);
    }
    return data;
  }

  /**
   * @Description: 登出操作
   * @param {LogoutDto} req
   * @return {*}
   */
  async logoutApi(body: LogoutDto): Promise<boolean> {
    const { id } = body;
    const accessTokenEntity = await this.accessTokenRepository.findOne({
      where: { userId: id },
    });
    if (accessTokenEntity) {
      // 从Redis中删除token
      await this.redisService.del(accessTokenEntity.token);
      // 使用软删除保持与实体配置一致
      await this.accessTokenRepository.softRemove(accessTokenEntity);
      return true;
    }
    return false;
  }

  async refreshTokenApi(body: { refreshToken: string }): Promise<LoginVo> {
    const { refreshToken } = body;
    // 验证refreshToken是否有效
    const accessTokenEntity = await this.accessTokenRepository.findOne({
      where: { refreshToken },
    });

    if (!accessTokenEntity) {
      throw new HttpException(
        JSON.stringify({ code: 10035, message: '刷新令牌无效' }),
        HttpStatus.OK
      );
    }

    // 检查refreshToken是否过期
    if (dayjs().isAfter(dayjs(accessTokenEntity.expirationTime))) {
      throw new HttpException(
        JSON.stringify({ code: 10036, message: '刷新令牌已过期' }),
        HttpStatus.OK
      );
    }

    // 获取用户信息
    const userEntity = await this.userRepository.findOne({
      where: { id: accessTokenEntity.userId },
    });

    if (!userEntity) {
      throw new HttpException(
        JSON.stringify({ code: 10037, message: '用户不存在' }),
        HttpStatus.OK
      );
    }

    // 生成新的token和refreshToken
    const {
      token: newToken,
      refreshToken: newRefreshToken,
      expirationTime: newExpirationTime,
    } = this.createToken();

    // 从Redis中删除旧token
    await this.redisService.del(accessTokenEntity.token);
    // 更新token信息
    await this.accessTokenRepository.update(accessTokenEntity.id, {
      token: newToken,
      refreshToken: newRefreshToken,
      expirationTime: newExpirationTime,
    });
    // 将用户信息存储到Redis中
    await this.redisService.set(newToken, {
      id: userEntity.id,
      username: userEntity.username,
    });

    // 构建返回数据
    const data: LoginVo = {
      id: userEntity.id,
      username: userEntity.username,
      token: newToken,
      refreshToken: newRefreshToken,
    };

    return data;
  }

  private createToken(): {
    token: string;
    refreshToken: string;
    expirationTime: Date;
  } {
    const token = this.toolsService.uuidToken;
    const refreshToken = this.toolsService.uuidToken;
    const expirationTime = dayjs().add(this.refreshTokenExpire, 'day').toDate();
    return {
      token,
      refreshToken,
      expirationTime,
    };
  }
}
