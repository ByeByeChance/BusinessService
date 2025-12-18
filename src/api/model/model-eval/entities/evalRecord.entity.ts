import { SharedEntity } from '@src/shared/entities/base.entity';
import { Entity, Column } from 'typeorm';

@Entity('evalRecord')
export class EvalRecordEntity extends SharedEntity {
  @Column({
    type: 'varchar',
    length: 255,
    name: 'name',
    comment: '任务名称',
  })
  name!: string;

  @Column({
    type: 'int',
    name: 'status',
    comment: '状态 (0: 待评测, 1: 评测中, 2: 已完成, 3: 已取消, 4: 评测失败)',
    nullable: false,
  })
  status!: number;

  @Column({
    type: 'float',
    name: 'score',
    comment: '评分',
    nullable: true,
  })
  score?: number;

  @Column({
    type: 'varchar',
    length: 36,
    name: 'sampleGroupIds',
    comment: '所属样本组ID集合 (UUID)(sampleGroup-1, sampleGroup-2, ...)',
    nullable: false,
  })
  sampleGroupIds!: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'sampleGroupNames',
    comment: '所属样本组名称集合 (sampleGroup-1, sampleGroup-2, ...)',
    nullable: false,
  })
  sampleGroupNames!: string;

  @Column({
    type: 'varchar',
    length: 36,
    name: 'debugRecordId',
    comment: '评测调试记录ID (UUID)',
    nullable: false,
  })
  debugRecordId!: string;

  @Column({
    type: 'varchar',
    length: 36,
    name: 'imageId',
    comment: '评测镜像ID (UUID)',
    nullable: false,
  })
  imageId!: string;

  @Column({
    type: 'varchar',
    length: 36,
    name: 'imageName',
    comment: '评测镜像名称',
    nullable: false,
  })
  imageName!: string;

  @Column({
    type: 'varchar',
    length: 36,
    name: 'algorithmId',
    comment: '评测算法ID (UUID)',
    nullable: false,
  })
  algorithmId!: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'algorithmName',
    comment: '评测算法名称',
    nullable: false,
  })
  algorithmName!: string;

  @Column({
    type: 'varchar',
    length: 36,
    name: 'modelId',
    comment: '评测模型ID',
    nullable: false,
  })
  modelId!: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'modelName',
    comment: '评测模型名称',
    nullable: false,
  })
  modelName!: string;

  @Column({
    type: 'text',
    name: 'description',
    nullable: true,
    comment: '描述',
  })
  description?: string;

  @Column({
    type: 'text',
    name: 'resultMessage',
    nullable: true,
    comment: '结果消息',
  })
  resultMessage?: string;

  @Column({
    type: 'int',
    name: 'startTime',
    nullable: true,
    comment: '开始时间',
  })
  startTime?: number;

  @Column({
    type: 'int',
    name: 'endTime',
    nullable: true,
    comment: '结束时间',
  })
  endTime?: number;

  @Column({
    type: 'int',
    name: 'duration',
    nullable: true,
    comment: '持续时间 (秒)',
  })
  duration?: number;

  @Column({
    type: 'text',
    name: 'metrics',
    nullable: true,
    comment: '指标数据',
  })
  metrics?: string;
}
