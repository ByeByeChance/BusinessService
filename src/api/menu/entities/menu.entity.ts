import { SharedEntity } from '@src/shared/entities/base.entity';
import { Entity, Column, ManyToMany } from 'typeorm';
import { RoleEntity } from '@src/api/role/entities/role.entity';

@Entity('menu')
export class MenuEntity extends SharedEntity {
  @Column({
    type: 'varchar',
    name: 'parentId',
    nullable: true,
    length: 36,
    comment: '父级id',
  })
  parentId?: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'path',
    comment: '菜单路径',
  })
  path!: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'name',
    comment: '菜单name',
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'component',
    comment: '组件路径',
  })
  component?: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'redirect',
    comment: '重定向菜单路径',
  })
  redirect!: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'icon',
    comment: '菜单图标',
  })
  icon!: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'title',
    comment: '菜单名称',
  })
  title!: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'isLink',
    comment: '是否外链',
  })
  isLink!: string;

  @Column({
    type: 'int',
    name: 'isHide',
    comment: '是否隐藏',
  })
  isHide!: number;

  @Column({
    type: 'int',
    name: 'isFull',
    comment: '是否全屏',
  })
  isFull!: number;

  @Column({
    type: 'int',
    name: 'isAffix',
    comment: '是否在标签栏固定',
  })
  isAffix!: number;

  @Column({
    type: 'int',
    name: 'isKeepAlive',
    comment: '是否缓存页面',
  })
  isKeepAlive!: number;

  @Column({
    type: 'int',
    name: 'sort',
    comment: '排序',
  })
  sort!: number;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'permission',
    comment: '权限标识',
    nullable: true,
  })
  permission?: string;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'type',
    comment: '菜单类型(directory:目录,menu:菜单,button:按钮,api:接口)',
    default: 'menu',
  })
  type!: string;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'componentName',
    comment: '组件名称',
    nullable: true,
  })
  componentName?: string;

  // 菜单-角色多对多关系
  @ManyToMany(() => RoleEntity, (role) => role.menus)
  roles!: RoleEntity[];
}
