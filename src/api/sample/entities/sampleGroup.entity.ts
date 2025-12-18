import { SharedEntity } from '@src/shared/entities/base.entity';
import { Entity, Column, Index } from 'typeorm';

export const SampleGroupTagEnum = {
  debug_training: '训练调试数据集',
  debug_evaluation: '评测调试数据集',
  training: '训练数据集',
  evaluation: '评测数据集',
} as const;

export type SampleGroupTag = keyof typeof SampleGroupTagEnum;

@Entity('sampleGroup')
export class SampleGroupEntity extends SharedEntity {
  // id字段继承自SharedEntity，类型为string
  @Column({
    type: 'varchar',
    length: 255,
    name: 'name',
    comment: '数据集名称',
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'tag',
    comment: '数据集标签',
  })
  tag!: SampleGroupTag;

  @Column({
    type: 'int',
    name: 'sample_count',
    default: 0,
    comment: '样本数量',
  })
  sampleCount!: number;

  @Column({
    type: 'text',
    name: 'description',
    nullable: true,
    comment: '描述',
  })
  description?: string;

  @Index()
  @Column({
    type: 'varchar',
    length: 36,
    name: 'user_id',
    comment: '用户ID',
  })
  userId!: string;

  @Column({
    type: 'varchar',
    length: 36,
    name: 'resource_id',
    comment: '资源ID',
  })
  resourceId!: string;
}
