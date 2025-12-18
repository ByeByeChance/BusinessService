import { SharedEntity } from '@src/shared/entities/base.entity';
import { Entity, Column } from 'typeorm';

@Entity('accessToken')
export class AccessTokenEntity extends SharedEntity {
  @Column({
    type: 'varchar',
    name: 'userId',
    nullable: false,
    length: 36,
    comment: '用户id (UUID)',
  })
  userId!: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'token',
    nullable: false,
    comment: '登陆token',
  })
  token!: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'refreshToken',
    nullable: false,
    comment: '刷新token',
  })
  refreshToken!: string;

  @Column({
    type: 'datetime',
    name: 'expirationTime',
    nullable: false,
    comment: '过期时间',
  })
  expirationTime!: Date;
}
