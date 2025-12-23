import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { RedisService } from '@src/plugin/redis/redis.service';
import { UserEntity } from '@src/api/user/entities/user.entity';
import { RoleEntity } from '@src/api/role/entities/role.entity';

@Injectable()
export class CacheService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly redisService: RedisService
  ) {}

  /**
   * @Description: 生成用户权限缓存key
   * @param {string} userId
   * @return {string}
   */
  public getUserPermissionCacheKey(userId: string): string {
    return `user_permission_${userId}`;
  }

  /**
   * @Description: 清除单个用户的权限缓存
   * @param {string} userId
   * @return {Promise<void>}
   */
  public async clearUserPermissionCache(userId: string): Promise<void> {
    const cacheKey = this.getUserPermissionCacheKey(userId);
    await this.redisService.del(cacheKey);
  }

  /**
   * @Description: 清除多个用户的权限缓存
   * @param {string[]} userIds
   * @return {Promise<void>}
   */
  public async clearUsersPermissionCache(userIds: string[]): Promise<void> {
    for (const userId of userIds) {
      await this.clearUserPermissionCache(userId);
    }
  }

  /**
   * @Description: 清除特定角色下所有用户的权限缓存
   * @param {string} roleId
   * @return {Promise<void>}
   */
  public async clearRoleUsersPermissionCache(roleId: string): Promise<void> {
    const users = await this.userRepository.find({
      where: { roleId },
      select: ['id'],
    });

    const userIds = users.map((user) => user.id);
    await this.clearUsersPermissionCache(userIds);
  }

  /**
   * @Description: 根据角色ID列表清除多个角色下所有用户的权限缓存
   * @param {string[]} roleIds
   * @return {Promise<void>}
   */
  public async clearRolesUsersPermissionCache(roleIds: string[]): Promise<void> {
    const users = await this.userRepository.find({
      where: { roleId: In(roleIds) },
      select: ['id'],
    });

    const userIds = users.map((user) => user.id);
    await this.clearUsersPermissionCache(userIds);
  }

  /**
   * @Description: 根据菜单ID清除所有拥有该菜单权限的用户的权限缓存
   * @param {string} menuId
   * @return {Promise<void>}
   */
  public async clearMenuUsersPermissionCache(menuId: string): Promise<void> {
    // 查找所有关联了该菜单的角色
    const roles = await this.roleRepository.find({
      where: {},
      relations: ['menus'],
    });

    const roleIdsWithMenu = roles
      .filter((role) => role.menus.some((menu) => menu.id === menuId))
      .map((role) => role.id);

    if (roleIdsWithMenu.length > 0) {
      await this.clearRolesUsersPermissionCache(roleIdsWithMenu);
    }
  }
}
