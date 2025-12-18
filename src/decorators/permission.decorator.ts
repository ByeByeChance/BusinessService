import { SetMetadata } from '@nestjs/common';

/**
 * 权限装饰器
 * @param permissions 权限标识列表
 */
export const RequirePermissions = (...permissions: string[]) => {
  return SetMetadata('requirePermissions', permissions);
};

/**
 * 角色装饰器
 * @param roles 角色列表
 */
export const RequireRoles = (...roles: string[]) => {
  return SetMetadata('requireRoles', roles);
};
