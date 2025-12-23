import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@src/api/user/entities/user.entity';
import { RedisService } from '@src/plugin/redis/redis.service';
import { CacheService } from '@src/shared/services/cache.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly redisService: RedisService,
    private readonly cacheService: CacheService
  ) {}

  // 获取白名单，白名单内的接口不需要验证
  private getWhitelist(): string[] {
    return ['/login', '/logout', '/refreshToken'];
  }

  // 获取需要权限的接口所需的角色和权限
  private getNeedPermission(
    context: ExecutionContext,
    type?: 'requireRoles' | 'requirePermissions'
  ): string[] {
    // 使用正确的装饰器元数据键
    if (type === 'requireRoles') {
      return this.reflector.get<string[]>('requireRoles', context.getHandler()) || [];
    } else if (type === 'requirePermissions') {
      return this.reflector.get<string[]>('requirePermissions', context.getHandler()) || [];
    }

    // 如果没有指定类型，返回空数组
    return [];
  }

  // 获取用户拥有的角色和权限
  private getUserPermission(user: UserEntity): {
    userPermissions: string[];
    userRoleNames: string[];
  } {
    const userPermissions: string[] = [];
    const userRoleNames: string[] = [];

    if (user.role) {
      userRoleNames.push(user.role.name);

      if (user.role.menus) {
        user.role.menus.forEach((menu) => {
          if (menu.permission && menu.permission !== '') {
            userPermissions.push(menu.permission);
          }
        });
      }
    }

    return { userPermissions, userRoleNames };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 获取请求对象
    const request = context.switchToHttp().getRequest();

    // 排除登录相关的接口
    const url = request.url;
    if (this.getWhitelist().includes(url)) {
      return true;
    }

    // 检查用户是否已认证
    if (!request.user || !request.user.id) {
      throw new UnauthorizedException('未获取到用户信息，请重新登录');
    }

    const userId = request.user.id;
    const cacheKey = this.cacheService.getUserPermissionCacheKey(userId);

    // 尝试从缓存中获取用户权限信息
    let userPermissionInfo = await this.redisService.get<{
      user: UserEntity;
      userPermissions: string[];
      userRoleNames: string[];
    }>(cacheKey);

    if (!userPermissionInfo) {
      // 缓存不存在，从数据库获取用户信息
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['role', 'role.menus'],
      });

      if (!user) {
        throw new UnauthorizedException('用户不存在，请重新登录');
      }

      // 检查用户是否是管理员角色
      if (user.role && user.role.name === 'admin') {
        return true;
      } else if (!user.role) {
        throw new UnauthorizedException('用户未分配角色，请联系管理员');
      }

      // 收集用户的所有权限
      const { userPermissions, userRoleNames } = this.getUserPermission(user);

      // 构造用户权限信息
      userPermissionInfo = {
        user,
        userPermissions,
        userRoleNames,
      };

      // 将权限信息存入Redis缓存
      await this.redisService.set(cacheKey, userPermissionInfo);
    } else if (typeof userPermissionInfo === 'string') {
      // 如果缓存是字符串格式，解析为对象
      userPermissionInfo = JSON.parse(userPermissionInfo);
    }

    // 检查是否有角色或权限要求
    const requiredRoles = this.getNeedPermission(context, 'requireRoles');
    const requiredPermissions = this.getNeedPermission(context, 'requirePermissions');

    // 确保userPermissionInfo不为null
    if (!userPermissionInfo) {
      throw new ForbiddenException('用户权限信息缺失，无法进行权限验证');
    }

    // 角色验证
    if (requiredRoles && requiredRoles.length > 0) {
      if (!userPermissionInfo.userRoleNames) {
        throw new ForbiddenException('用户角色信息缺失，无法进行权限验证');
      }
      const hasRequiredRole = requiredRoles.some((role) =>
        userPermissionInfo.userRoleNames.includes(role)
      );

      if (hasRequiredRole) {
        return true;
      }
    }

    // 权限验证
    if (requiredPermissions && requiredPermissions.length > 0) {
      if (!userPermissionInfo.userPermissions) {
        throw new ForbiddenException('用户权限信息缺失，无法进行权限验证');
      }
      const hasPermission = requiredPermissions.every((permission) =>
        userPermissionInfo.userPermissions.includes(permission)
      );

      if (hasPermission) {
        return true;
      } else {
        throw new ForbiddenException('没有操作权限，请联系管理员');
      }
    }

    // 如果没有角色或权限要求，允许访问
    return true;
  }
}
