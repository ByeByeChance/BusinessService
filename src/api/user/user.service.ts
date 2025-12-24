import { ToolsService } from '@src/plugin/tools/tools.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { FindOperator, ILike, LessThanOrEqual, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PageEnum } from '@src/enums/page.enum';
import { UserVo } from './vo/user.vo';
import { QueryUserDto } from './dto/user.query';
import { UserEntity } from './entities/user.entity';
import { UserDto } from './dto/user.dto';
import { ResultListVo } from '@src/shared/vo/result.vo';
import { RoleEntity } from '@src/api/role/entities/role.entity';
import { CacheService } from '@src/shared/services/cache.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly toolsService: ToolsService,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly cacheService: CacheService
  ) {}

  /**
   * @Description: 获取用户列表
   * @param {UserDto} queryOption
   * @return {*}
   */
  async getUserList(queryOption: QueryUserDto): Promise<ResultListVo<UserVo>> {
    const {
      id,
      username,
      status,
      current = PageEnum.PAGE_NUMBER,
      pageSize = PageEnum.PAGE_SIZE,
      createdTimeStart,
      createdTimeEnd,
      updatedTimeStart,
      updatedTimeEnd,
    } = queryOption;
    const query: Record<string, FindOperator<string> | string | number | Date> = {
      ...(id && { id }),
      ...(username && { username: ILike(`%${username}%`) }),
      ...(status && { status }),
      ...(createdTimeStart && { createdTime: MoreThanOrEqual(createdTimeStart) }),
      ...(createdTimeEnd && { createdTime: LessThanOrEqual(createdTimeEnd) }),
      ...(updatedTimeStart && { updatedTime: MoreThanOrEqual(updatedTimeStart) }),
      ...(updatedTimeEnd && { updatedTime: LessThanOrEqual(updatedTimeEnd) }),
    };

    const total = await this.userRepository.createQueryBuilder('user').where([query]).getCount();
    const queryBuilder = this.queryUserBuilder().where([query]);
    const data = await queryBuilder
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
   * @Description: 新增用户
   * @param {UserDto} req
   * @return {*}
   */
  async addUser(req: UserDto): Promise<string> {
    const userEntity: Pick<UserEntity, 'id'> | null = await this.userRepository.findOne({
      where: {
        username: req.username,
      },
      select: ['id'],
    });
    if (userEntity?.id) {
      throw new BadRequestException(`用户已存在`);
    }
    if (req.roleId) {
      const roleEntity: Pick<RoleEntity, 'id'> | null = await this.roleRepository.findOne({
        where: {
          id: req.roleId,
        },
        select: ['id'],
      });
      if (!roleEntity?.id) {
        throw new BadRequestException(`角色不存在`);
      }
    }
    // 默认密码加密
    const password = await this.toolsService.makePassword(req.password);
    // 创建数据
    const data = this.userRepository.create({
      username: req.username,
      password,
      email: req.email,
      status: req.status,
      roleId: req.roleId,
    });
    await this.userRepository.save(data);
    return '创建成功';
  }

  /**
   * @Description: 用户修改信息
   * @param {string} id 用户ID
   * @param {UserDto} req 修改信息
   * @return {*}
   */
  async updateUser(id: string, req: Partial<UserDto>): Promise<string> {
    const userEntity: UserEntity | null = await this.userRepository.findOne({
      where: { id },
    });
    if (!userEntity?.id) {
      throw new BadRequestException(`用户不存在`);
    }

    // 更新用户信息
    const updateData: Partial<UserEntity> = {};
    if (req.username) {
      // 检查用户名是否已存在
      const existingUser = await this.userRepository.findOne({
        where: { username: req.username, id: Not(id) },
        select: ['id'],
      });
      if (existingUser) {
        throw new BadRequestException(`用户名已存在`);
      }
      updateData.username = req.username;
    }

    if (req.email) updateData.email = req.email;
    if (req.status !== undefined) updateData.status = req.status;

    // 检查角色是否变化
    if (req.roleId !== undefined && req.roleId !== userEntity.roleId) {
      // 验证角色是否存在
      if (req.roleId) {
        const roleEntity: Pick<RoleEntity, 'id'> | null = await this.roleRepository.findOne({
          where: { id: req.roleId },
          select: ['id'],
        });
        if (!roleEntity?.id) {
          throw new BadRequestException(`角色不存在`);
        }
      }
      updateData.roleId = req.roleId;

      // 清除用户权限缓存
      await this.cacheService.clearUserPermissionCache(id);
    }

    const { affected } = await this.userRepository.update(id, updateData);
    if (affected) {
      return '更新成功';
    } else {
      return '更新失败';
    }
  }

  /**
   * @Description: 用户修改密码
   * @param {string} id 用户ID
   * @param {string} oldPassword 旧密码
   * @param {string} newPassword 新密码
   * @return {*}
   */
  async updatePassword(
    currentUser: UserEntity,
    id: string,
    oldPassword: string,
    newPassword: string
  ): Promise<string> {
    // 检查登录用户是否与需要修改密码的用户一致
    if (currentUser.id !== id) {
      throw new BadRequestException(`登录帐号与需要修改密码的帐号不一致`);
    }
    const userEntity: UserEntity | null = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'password'],
    });
    if (!userEntity?.id) {
      throw new BadRequestException(`用户不存在`);
    }

    // 验证旧密码
    const isPasswordValid = await this.toolsService.validatePassword(
      oldPassword,
      userEntity.password
    );
    if (!isPasswordValid) {
      throw new BadRequestException(`旧密码错误`);
    }

    // 更新新密码
    const password = await this.toolsService.makePassword(newPassword);

    const { affected } = await this.userRepository.update(id, { password });
    if (affected) {
      return '密码更新成功';
    } else {
      return '密码更新失败';
    }
  }

  /**
   * @Description: 删除用户
   * @param {id} id
   * @return {*}
   */
  async deleteUserById(id: string): Promise<string> {
    const userEntity: UserEntity | null = await this.userRepository.findOne({
      where: { id },
      select: ['id'],
    });
    if (!userEntity?.id) {
      throw new BadRequestException(`用户不存在`);
    }
    const { affected } = await this.userRepository.softDelete(id);
    if (affected) {
      return '删除成功';
    } else {
      return '删除失败';
    }
  }

  /**
   * 构建用户查询
   */
  private queryUserBuilder(queryBuilder = this.userRepository.createQueryBuilder('user')) {
    // 使用数组方式选择字段，避免类型推断问题
    queryBuilder.select([
      'user.id',
      'user.username',
      'user.email',
      'user.status',
      'user.roleId',
      'user.lastLoginDate',
      'user.createdTime',
      'user.updatedTime',
    ]);
    return queryBuilder.orderBy('user.createdTime', 'DESC');
  }

  /**
   * 构建用户查询（包含角色信息）
   */
  // private queryUserWithRolesBuilder() {
  //   const queryBuilder = this.userRepository.createQueryBuilder('user');
  //   // 使用数组方式选择字段
  //   queryBuilder.select([
  //     'user.id',
  //     'user.username',
  //     'user.email',
  //     'user.status',
  //     'user.roleId',
  //     'user.lastLoginDate',
  //     'user.createdTime',
  //     'user.updatedTime',
  //   ]);
  //   // 显式连接角色表并选择角色信息
  //   queryBuilder
  //     .leftJoinAndSelect('user.role', 'role')
  //     .addSelect(['role.id', 'role.name', 'role.description']);
  //   return queryBuilder;
  // }
}
