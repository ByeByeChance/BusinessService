import { SharedEntity } from '@src/shared/entities/base.entity';
import { Entity, Column } from 'typeorm';

@Entity('image')
export class ImageEntity extends SharedEntity {
  @Column({
    type: 'varchar',
    length: 255,
    name: 'name',
    comment: '镜像名称',
  })
  name!: string;

  @Column({
    type: 'bigint',
    name: 'size',
    comment: '文件大小（字节）',
  })
  size!: number;

  @Column({
    type: 'varchar',
    length: 36,
    name: 'resourceId',
    comment: '资源ID (UUID)',
  })
  resourceId!: string;

  @Column({
    type: 'text',
    name: 'description',
    nullable: true,
    comment: '描述',
  })
  description?: string;

  @Column({
    type: 'varchar',
    length: 36,
    name: 'userId',
    comment: '用户ID',
  })
  userId!: string;
}
