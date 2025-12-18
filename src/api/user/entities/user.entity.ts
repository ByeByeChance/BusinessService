import { SharedEntity } from '@src/shared/entities/base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { RoleEntity } from '@src/api/role/entities/role.entity';

@Entity('user')
export class UserEntity extends SharedEntity {
  @Column({
    type: 'varchar',
    length: 50,
    name: 'username',
    nullable: true,
    comment: '账号',
  })
  username!: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'password',
    comment: '密码',
  })
  password!: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'email',
    comment: '邮箱',
  })
  email?: string;

  @Column({
    type: 'int',
    name: 'status',
    comment: '账号状态',
  })
  status!: number;

  @Column({
    type: 'varchar',
    length: 36,
    name: 'roleId',
    nullable: true,
    comment: '角色ID (UUID)',
  })
  roleId?: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'salt',
    nullable: true,
    comment: '密码盐',
  })
  salt?: string;

  @Column({
    type: 'datetime',
    name: 'lastLoginDate',
    nullable: true,
    comment: '最后登录时间',
  })
  lastLoginDate!: Date;

  // 用户-角色一对多关系
  @ManyToOne(() => RoleEntity, (role) => role.users, { nullable: true })
  @JoinColumn({ name: 'roleId', referencedColumnName: 'id' })
  role?: RoleEntity;
}
