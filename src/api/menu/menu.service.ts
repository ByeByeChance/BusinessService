import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FindOperator, ILike, Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PageEnum } from '@src/enums/page.enum';
import { MenuItemVo } from './vo/menu.vo';
import { ResultListVo } from '@src/shared/vo/result.vo';
import { QueryMenuDto } from './dto/menu.query';
import { MenuEntity } from './entities/menu.entity';
import { MenuDto } from './dto/menu.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuEntity)
    private readonly MenuRepository: Repository<MenuEntity>
  ) {}

  /**
   * @Description: 获取菜单列表
   * @param {MenuDto} queryOption
   * @return {*}
   */
  async getMenuList(queryOption: QueryMenuDto): Promise<ResultListVo<MenuItemVo>> {
    const { title, path, current, pageSize } = queryOption;
    const query: Record<string, FindOperator<string>> = {
      ...(title && { title: ILike(`%${title}%`) }),
      ...(path && { path: ILike(`%${path}%`) }),
    };

    const total = await this.MenuRepository.createQueryBuilder('menu').where([query]).getCount();
    const queryBuilder = this.queryMenuBuilder();
    const data = await queryBuilder.where([query]).offset(0).limit(1000).getMany();
    return {
      list: this.createMenuMethod(data),
      total,
      current: current || PageEnum.PAGE_NUMBER,
      pageSize: pageSize || PageEnum.PAGE_SIZE,
    };
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
      parentId: req.parentId ? req.parentId.toString() : undefined,
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
      throw new HttpException(`菜单ID不能为空`, HttpStatus.BAD_REQUEST);
    }

    const MenuEntity: MenuEntity | null = await this.MenuRepository.findOne({
      where: { id: req.id },
    });
    if (!MenuEntity?.id) {
      throw new HttpException(`菜单不存在`, HttpStatus.BAD_REQUEST);
    }
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
        updatedTime: +new Date(),
      }
    );
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
      throw new HttpException(`菜单不存在`, HttpStatus.BAD_REQUEST);
    }
    const { affected } = await this.MenuRepository.softDelete(id);
    if (affected) {
      return '删除成功';
    } else {
      return '删除失败';
    }
  }

  // 内部查询方法
  private queryMenuBuilder(): SelectQueryBuilder<MenuEntity> {
    const queryBuilder = this.MenuRepository.createQueryBuilder('menu');

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
        permission: menuEntity.permission,
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
}
