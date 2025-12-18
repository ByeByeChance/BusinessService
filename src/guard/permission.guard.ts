import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@src/api/user/entities/user.entity';

@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly logger = new Logger(PermissionGuard.name);

  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 获取请求对象
    const request = context.switchToHttp().getRequest();

    // 排除登录相关的接口
    const url = request.url;
    if (url.includes('/login') || url.includes('/refreshToken')) {
      return true;
    }

    // 检查用户是否已认证
    if (!request.user || !request.user.id) {
      throw new HttpException(
        JSON.stringify({ code: 10024, message: '你还没登录,请先登录' }),
        HttpStatus.OK
      );
    }

    // 获取用户信息（包含角色和权限）
    let user;

    // 如果request.user已经包含了role信息（测试环境），直接使用它
    if (request.user.role) {
      user = { ...request.user, role: request.user.role };
    } else {
      // 否则从数据库中查询
      user = await this.userRepository.findOne({
        where: { id: request.user.id },
        relations: ['role', 'role.menus'],
      });

      if (!user) {
        throw new HttpException(
          JSON.stringify({ code: 10025, message: '用户不存在' }),
          HttpStatus.OK
        );
      }
    }

    // 检查用户是否是管理员角色（需要根据实际角色名称调整）
    if (user.role && user.role.name === 'admin') {
      return true;
    }

    // 获取需要的角色
    const requiredRoles = this.reflector.get<string[]>('requireRoles', context.getHandler()) || [];

    // 获取需要的权限
    const requiredPermissions =
      this.reflector.get<string[]>('requirePermissions', context.getHandler()) || [];

    // 如果没有设置权限和角色要求，直接通过
    if (requiredRoles.length === 0 && requiredPermissions.length === 0) {
      return true;
    }

    // 收集用户的所有权限
    const userPermissions: string[] = [];
    const userRoleNames: string[] = [];

    if (user.role) {
      // 检查角色是否启用
      if (user.role.status === 0) {
        throw new HttpException(
          JSON.stringify({ code: 10027, message: '用户角色已被禁用' }),
          HttpStatus.OK
        );
      }

      userRoleNames.push(user.role.name);

      if (user.role.menus && user.role.menus.length > 0) {
        user.role.menus.forEach((menu: { permission: string }) => {
          if (menu.permission) {
            userPermissions.push(menu.permission);
          }
        });
      }
    }

    // 角色验证
    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some((role) => userRoleNames.includes(role));

      if (hasRequiredRole) {
        return true;
      }
    }

    // 权限验证
    if (requiredPermissions.length > 0) {
      const hasPermission = requiredPermissions.every((permission) =>
        userPermissions.includes(permission)
      );

      if (hasPermission) {
        return true;
      }
    }

    // 没有权限
    this.logger.warn(`用户${user.username}尝试访问没有权限的资源`);
    throw new HttpException(
      JSON.stringify({ code: 10026, message: '你没有权限访问该资源' }),
      HttpStatus.OK
    );
  }
}
