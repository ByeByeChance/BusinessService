import { SharedEntity } from '@src/shared/entities/base.entity';
import { Entity, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { MenuEntity } from '@src/api/menu/entities/menu.entity';
import { UserEntity } from '@src/api/user/entities/user.entity';

@Entity('role')
export class RoleEntity extends SharedEntity {
  @Column({
    type: 'varchar',
    length: 50,
    name: 'name',
    comment: '角色名称',
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'description',
    comment: '角色描述',
    nullable: true,
  })
  description?: string;

  @Column({
    type: 'int',
    name: 'status',
    comment: '状态(0:禁用,1:启用)',
    default: 1,
  })
  status!: number;

  @Column({
    type: 'int',
    name: 'sort',
    comment: '排序',
    default: 0,
  })
  sort!: number;

  // 角色-菜单(权限)多对多关系
  @ManyToMany(() => MenuEntity, (menu) => menu.roles, { cascade: false })
  @JoinTable({
    name: 'role_menu',
    joinColumns: [{ name: 'role_id', referencedColumnName: 'id' }],
    inverseJoinColumns: [{ name: 'menu_id', referencedColumnName: 'id' }],
  })
  menus!: MenuEntity[];

  // 角色-用户一对多关系
  @OneToMany(() => UserEntity, (user) => user.role)
  users!: UserEntity[];
}
