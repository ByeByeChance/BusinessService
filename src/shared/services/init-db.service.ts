import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@src/api/user/entities/user.entity';
import { RoleEntity } from '@src/api/role/entities/role.entity';
import { ToolsService } from '@src/plugin/tools/tools.service';
import { Repository } from 'typeorm';
@Injectable()
export class InitDbService implements OnModuleInit {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly configService: ConfigService,
    private readonly toolsService: ToolsService
  ) {}

  async onModuleInit() {
    try {
      await this.initData();
    } catch (error) {
      console.error('数据库初始化失败:', error);
    }
  }

  /**
   * @Description: 初始化账号和角色
   * @return {*}
   */
  private async initData(): Promise<void> {
    // 初始化角色
    const roleCount = await this.roleRepository.count();
    let adminRole: RoleEntity | null = null;

    if (roleCount === 0) {
      // 创建默认的admin角色
      adminRole = this.roleRepository.create({
        name: 'admin',
        description: '系统管理员',
        status: 1,
      });
      await this.roleRepository.save(adminRole);
    } else {
      // 查找admin角色
      adminRole = await this.roleRepository.findOne({
        where: { name: 'admin' },
      });

      // 如果没有admin角色，创建一个
      if (!adminRole) {
        adminRole = this.roleRepository.create({
          name: 'admin',
          description: '系统管理员',
          status: 1,
        });
        await this.roleRepository.save(adminRole);
      }
    }

    // 初始化账号
    const userCount = await this.userRepository.count();
    if (userCount === 0) {
      const username: string = this.configService.get('defaultAccount') ?? 'admin';
      const defaultPassword: string = this.configService.get('defaultPassword') ?? '123456';
      try {
        const password = await this.toolsService.makePassword(defaultPassword);
        const email: string = this.configService.get('defaultEmail') ?? 'admin@example.com';
        const userData = this.userRepository.create({
          username,
          password,
          status: 1,
          email,
          roleId: adminRole.id,
          lastLoginDate: new Date(), // 设置当前时间为最后登录时间
        });
        await this.userRepository.save(userData);
      } catch (error) {
        console.error('初始化用户失败:', error);
      }
    }
  }
}
