import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MenuItemVo } from './vo/menu.vo';
import { ResultListVo } from '@src/shared/vo/result.vo';
import { MenuEntity } from './entities/menu.entity';
import { MenuDto } from './dto/menu.dto';
import { ICurrentUserType } from '@src/decorators';
import { UserEntity } from '../user/entities/user.entity';
import { RoleEntity } from '../role/entities/role.entity';
import { CacheService } from '@src/shared/services/cache.service';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuEntity)
    private readonly MenuRepository: Repository<MenuEntity>,
    @InjectRepository(UserEntity)
    private readonly UserRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly RoleRepository: Repository<RoleEntity>,
    private readonly cacheService: CacheService
  ) {}

  /**
   * @Description: 获取菜单列表
   * @param {MenuDto} queryOption
   * @return {*}
   */
  async getMenuList(user: ICurrentUserType): Promise<ResultListVo<MenuItemVo>> {
    // 检查用户是否存在
    const userEntity = await this.UserRepository.findOne({
      where: { id: user.id },
    });
    if (!userEntity?.roleId) {
      throw new BadRequestException(`用户不存在或未分配角色`);
    }
    const roleEntity = await this.RoleRepository.findOne({
      where: { id: userEntity.roleId },
      relations: ['menus'],
    });
    if (!roleEntity) {
      throw new BadRequestException(`角色不存在`);
    }
    const menus = roleEntity.name === 'admin' ? await this.getAllMenu() : roleEntity.menus || [];
    return {
      list: this.createMenuMethod(menus),
      total: menus.length,
      current: 1,
      pageSize: menus.length,
    };
  }

  async getAllMenu(): Promise<MenuEntity[]> {
    const data = await this.queryMenuBuilder().offset(0).limit(10000).getMany();
    return data;
  }

  /**
   * @Description: 新增菜单
   * @param {MenuDto} req
   * @return {*}
   */
  async addMenu(req: MenuDto): Promise<string> {
    // 创建数据
    const data = this.MenuRepository.create({
      // 将数字类型转换为字符串，符合UUID要求
      id: req.id ? req.id : undefined,
      parentId: req.parentId ? req.parentId : undefined,
      name: req.name,
      path: req.path || '',
      component: req.component || '',
      componentName: req.componentName || '',
      redirect: req.redirect || '',
      icon: req.icon || '',
      title: req.title || '',
      isLink: req.isLink || '',
      isHide: req.isHide ? 1 : 0,
      isFull: req.isFull ? 1 : 0,
      isAffix: req.isAffix ? 1 : 0,
      isKeepAlive: req.isKeepAlive ? 1 : 0,
      permission: req.permission || '',
      type: req.type || 'menu',
      sort: req.sort || 0,
    });
    await this.MenuRepository.save(data);
    return '创建成功';
  }

  /**
   * @Description: 更新菜单
   * @param {MenuDto} req
   * @return {*}
   */
  async updateMenu(req: MenuDto): Promise<string> {
    // 检查id是否存在且有效
    if (!req.id) {
      throw new BadRequestException(`菜单ID不能为空`);
    }

    const MenuEntity: MenuEntity | null = await this.MenuRepository.findOne({
      where: { id: req.id },
    });
    if (!MenuEntity?.id) {
      throw new BadRequestException(`菜单不存在`);
    }

    // 检查权限相关字段是否发生变化
    const permissionChanged =
      req.permission !== MenuEntity.permission || req.type !== MenuEntity.type;

    await this.MenuRepository.update(
      { id: req.id },
      {
        parentId: req.parentId || undefined,
        name: req.name,
        path: req.path || '',
        component: req.component || '',
        componentName: req.componentName || '',
        redirect: req.redirect || '',
        icon: req.icon || '',
        title: req.title || '',
        isLink: req.isLink || '',
        isHide: req.isHide ? 1 : 0,
        isFull: req.isFull ? 1 : 0,
        isAffix: req.isAffix ? 1 : 0,
        isKeepAlive: req.isKeepAlive ? 1 : 0,
        permission: req.permission || '',
        type: req.type || 'menu',
        sort: req.sort || 0,
      }
    );

    // 如果权限相关字段发生变化，清除所有关联了该菜单的用户的权限缓存
    if (permissionChanged) {
      await this.clearUserPermissionCacheByMenuId(req.id);
    }

    return '更新成功';
  }

  /**
   * @Description: 删除菜单
   * @param {id} id
   * @return {*}
   */
  async deleteMenuById(id: string): Promise<string> {
    const MenuEntity: MenuEntity | null = await this.MenuRepository.findOne({
      where: { id },
    });
    if (!MenuEntity?.id) {
      throw new BadRequestException(`菜单不存在`);
    }

    // 在删除菜单前，清除所有关联了该菜单的用户的权限缓存
    await this.clearUserPermissionCacheByMenuId(id);

    const { affected } = await this.MenuRepository.softDelete(id);
    if (affected) {
      return '删除成功';
    } else {
      return '删除失败';
    }
  }

  // 内部查询方法
  private queryMenuBuilder(menuType = 'menu'): SelectQueryBuilder<MenuEntity> {
    const queryBuilder = this.MenuRepository.createQueryBuilder('menu').where('menu.type = :type', {
      type: menuType,
    });

    queryBuilder.select([
      'menu.id',
      'menu.parentId',
      'menu.name',
      'menu.path',
      'menu.component',
      'menu.componentName',
      'menu.redirect',
      'menu.icon',
      'menu.title',
      'menu.isLink',
      'menu.isHide',
      'menu.isFull',
      'menu.isAffix',
      'menu.isKeepAlive',
      'menu.permission',
      'menu.type',
      'menu.sort',
    ]);

    return queryBuilder.orderBy('menu.sort', 'ASC');
  }

  private handleMenuItem(menuEntity: MenuEntity): MenuItemVo {
    return {
      id: menuEntity.id,
      parentId: menuEntity.parentId,
      name: menuEntity.name,
      path: menuEntity.path,
      component: menuEntity.component,
      componentName: menuEntity.componentName,
      redirect: menuEntity.redirect,
      meta: {
        icon: menuEntity.icon,
        title: menuEntity.title,
        isLink: menuEntity.isLink,
        isHide: menuEntity.isHide === 1,
        isFull: menuEntity.isFull === 1,
        isAffix: menuEntity.isAffix === 1,
        isKeepAlive: menuEntity.isKeepAlive === 1,
        // permission: menuEntity.permission,
        type: menuEntity.type,
        sort: menuEntity.sort,
      },
    };
  }
  // 递归生成菜单
  private createMenuMethod(menuList: MenuEntity[], parentId = ''): MenuItemVo[] {
    const newMenuList: MenuItemVo[] = [];

    for (const item of menuList) {
      if (item.parentId == parentId) {
        const menuOptions = this.handleMenuItem(item);
        menuOptions.children = this.createMenuMethod(menuList, item.id);
        newMenuList.push(menuOptions);
      }
    }

    return newMenuList.sort((a, b) => (a.meta.sort || 0) - (b.meta.sort || 0));
  }

  /**
   * @Description: 根据菜单ID清除所有拥有该菜单权限的用户的权限缓存
   * @param {string} menuId
   * @return {*}
   */
  private async clearUserPermissionCacheByMenuId(menuId: string): Promise<void> {
    // 查找所有关联了该菜单的角色
    const roles = await this.RoleRepository.find({
      where: {},
      relations: ['menus'],
    });

    const roleIdsWithMenu = roles
      .filter((role) => role.menus.some((menu) => menu.id === menuId))
      .map((role) => role.id);

    if (roleIdsWithMenu.length > 0) {
      // 使用CacheService清除这些角色下所有用户的权限缓存
      await this.cacheService.clearRolesUsersPermissionCache(roleIdsWithMenu);
    }
  }
}
