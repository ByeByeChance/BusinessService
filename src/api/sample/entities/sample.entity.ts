import { SharedEntity } from '@src/shared/entities/base.entity';
import { Entity, Column } from 'typeorm';

@Entity('sample')
export class SampleEntity extends SharedEntity {
  @Column({
    type: 'varchar',
    length: 255,
    name: 'name',
    comment: '样本名称',
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'path',
    comment: '文件路径',
  })
  path!: string;

  @Column({
    type: 'bigint',
    name: 'size',
    comment: '文件大小（字节）',
  })
  size!: number;

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
    name: 'groupId',
    comment: '所属数据集ID (UUID)',
    nullable: true,
  })
  groupId?: string;
}
