import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  Repository,
  ILike,
  MoreThanOrEqual,
  LessThanOrEqual,
  SelectQueryBuilder,
  FindOperator,
  In,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PageEnum } from '@src/enums/page.enum';
import { RoleEntity } from './entities/role.entity';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { RoleVo } from './vo/role.vo';
import { ResultListVo } from '@src/shared/vo/result.vo';
import { MenuEntity } from '@src/api/menu/entities/menu.entity';
import { RoleQueryDto } from './dto/role.query';
import { UserEntity } from '@src/api/user/entities/user.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleEntity) private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(MenuEntity) private readonly menuRepository: Repository<MenuEntity>,
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>
  ) {}

  /**
   * @Description: 获取角色列表
   * @param {RoleQueryDto} queryOption
   * @return {*}
   */
  async getRoleList(queryOption: RoleQueryDto): Promise<ResultListVo<RoleVo>> {
    const {
      name,
      status,
      current = PageEnum.PAGE_NUMBER,
      pageSize = PageEnum.PAGE_SIZE,
      createdTimeStart,
      createdTimeEnd,
      updatedTimeStart,
      updatedTimeEnd,
    } = queryOption;

    const query: Record<string, FindOperator<string> | string | number | Date> = {
      ...(name && { name: ILike(`%${name}%`) }),
      ...(status && { status }),
      ...(createdTimeStart && { createdTime: MoreThanOrEqual(createdTimeStart) }),
      ...(createdTimeEnd && { createdTime: LessThanOrEqual(createdTimeEnd) }),
      ...(updatedTimeStart && { updatedTime: MoreThanOrEqual(updatedTimeStart) }),
      ...(updatedTimeEnd && { updatedTime: LessThanOrEqual(updatedTimeEnd) }),
    };

    const total = await this.roleRepository.createQueryBuilder('role').where([query]).getCount();
    const queryBuilder = this.queryRoleBuilder();
    const data = await queryBuilder
      .where([query])
      .offset((current - 1) * pageSize)
      .limit(pageSize)
      .getMany();

    return {
      list: data,
      total,
      current,
      pageSize,
    };
  }

  /**
   * @Description: 创建角色
   * @param {CreateRoleDto} createRoleDto
   * @return {*}
   */
  async createRole(createRoleDto: CreateRoleDto): Promise<string> {
    // 检查角色名称是否已存在
    const existingRole = await this.roleRepository.findOne({ where: { name: createRoleDto.name } });
    if (existingRole) {
      throw new HttpException(`角色名称已存在`, HttpStatus.BAD_REQUEST);
    }

    const role = this.roleRepository.create(createRoleDto);
    await this.roleRepository.save(role);

    // 如果有分配菜单权限
    if (createRoleDto.menuIds && createRoleDto.menuIds.length > 0) {
      await this.assignMenusToRole(role.id, createRoleDto.menuIds);
    }

    return '角色创建成功';
  }

  /**
   * @Description: 更新角色
   * @param {string} id
   * @param {UpdateRoleDto} updateRoleDto
   * @return {*}
   */
  async updateRole(id: string, updateRoleDto: UpdateRoleDto): Promise<string> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new HttpException(`角色不存在`, HttpStatus.BAD_REQUEST);
    }

    // 检查角色名称是否已存在（排除当前角色）
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name },
      });
      if (existingRole) {
        throw new HttpException(`角色名称已存在`, HttpStatus.BAD_REQUEST);
      }
    }

    // 更新角色基本信息
    await this.roleRepository.update(id, updateRoleDto);

    // 如果有分配菜单权限
    if (updateRoleDto.menuIds !== undefined) {
      await this.assignMenusToRole(id, updateRoleDto.menuIds || []);
    }

    return '角色更新成功';
  }

  /**
   * @Description: 删除角色
   * @param {string} id
   * @return {*}
   */
  async deleteRole(id: string): Promise<string> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new HttpException(`角色不存在`, HttpStatus.BAD_REQUEST);
    }

    // 检查角色是否被用户使用
    const userCount = await this.userRepository
      .createQueryBuilder('user')
      .where('user.roleId = :roleId', { roleId: id })
      .getCount();
    if (userCount > 0) {
      throw new HttpException(`角色已被用户使用，无法删除`, HttpStatus.BAD_REQUEST);
    }

    // 这里需要根据实际业务逻辑实现，暂时省略

    // 删除角色
    await this.roleRepository.delete(id);
    return '角色删除成功';
  }

  /**
   * @Description: 获取角色详情
   * @param {string} id
   * @return {*}
   */
  async getRoleById(id: string): Promise<RoleVo> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['menus'],
    });

    if (!role) {
      throw new HttpException(`角色不存在`, HttpStatus.BAD_REQUEST);
    }

    // 转换为VO对象，添加menuIds字段
    return {
      ...role,
      menuIds: role.menus.map((menu) => menu.id),
    };
  }

  /**
   * @Description: 分配菜单权限给角色
   * @param {string} roleId
   * @param {string[]} menuIds
   * @return {*}
   */
  async assignMenusToRole(roleId: string, menuIds: string[]): Promise<string> {
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new HttpException(`角色不存在`, HttpStatus.BAD_REQUEST);
    }

    // 获取所有要分配的菜单
    const menus = await this.menuRepository.findBy({ id: In(menuIds) });
    if (menus.length !== menuIds.length) {
      throw new HttpException(`部分菜单不存在`, HttpStatus.BAD_REQUEST);
    }

    // 更新角色的菜单关联
    role.menus = menus;
    await this.roleRepository.save(role);

    return '菜单权限分配成功';
  }

  /**
   * @Description: 获取所有角色（用于下拉选择）
   * @return {*}
   */
  async getAllRoles(): Promise<RoleVo[]> {
    const roles = await this.roleRepository.find({ where: { status: 1 }, order: { sort: 'ASC' } });
    // 转换为VO对象
    return roles.map((role) => ({
      ...role,
      menuIds: [], // 不包含菜单信息，因为是用于下拉选择
    }));
  }

  // 内部查询构建器方法
  private queryRoleBuilder(): SelectQueryBuilder<RoleEntity> {
    const queryBuilder = this.roleRepository.createQueryBuilder('role');
    queryBuilder.select([
      'role.id',
      'role.name',
      'role.description',
      'role.status',
      'role.sort',
      'role.createdTime',
      'role.updatedTime',
    ]);
    return queryBuilder.orderBy('role.sort', 'ASC');
  }
}
