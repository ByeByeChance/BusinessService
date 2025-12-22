import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@src/api/user/entities/user.entity';
import { MenuEntity } from '@src/api/menu/entities/menu.entity';

@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly logger = new Logger(PermissionGuard.name);

  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>
  ) {}

  private getWhitelist() {
    return ['/login', '/logout', '/refreshToken'];
  }

  private getNeedPermission(context: ExecutionContext): {
    requiredRoles: string[];
    requiredPermissions: string[];
  } {
    // 获取需要的角色
    const requiredRoles = this.reflector.get<string[]>('requireRoles', context.getHandler()) || [];

    // 获取需要的权限
    const requiredPermissions =
      this.reflector.get<string[]>('requirePermissions', context.getHandler()) || [];

    return { requiredRoles, requiredPermissions };
  }

  private getUserPermission(user: UserEntity): {
    userPermissions: string[];
    userRoleNames: string[];
  } {
    const userPermissions: string[] = [];
    const userRoleNames: string[] = [];

    userRoleNames.push(user.role?.name || '');

    if (user.role?.menus && user.role.menus.length > 0) {
      user.role.menus.forEach((menu: MenuEntity) => {
        if (menu.permission) {
          userPermissions.push(menu.permission);
        }
      });
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

    // 获取用户信息（包含角色和权限）
    const user = await this.userRepository.findOne({
      where: { id: request.user.id },
      relations: ['role', 'role.menus'],
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在，请重新登录');
    }

    // 检查用户是否是管理员角色（需要根据实际角色名称调整）
    if (user.role && user.role.name === 'admin') {
      return true;
    } else if (!user.role) {
      throw new UnauthorizedException('用户未分配角色，请联系管理员');
    }

    const { requiredRoles, requiredPermissions } = this.getNeedPermission(context);

    // 如果没有设置权限和角色要求，直接通过
    if (requiredRoles.length === 0 && requiredPermissions.length === 0) {
      return true;
    }

    // 收集用户的所有权限
    const { userPermissions, userRoleNames } = this.getUserPermission(user);

    // 1.角色验证
    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some((role) => userRoleNames.includes(role));

      if (hasRequiredRole) {
        return true;
      }
    }

    // 2.权限验证
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
    throw new ForbiddenException('你没有权限访问该资源');
  }
}
