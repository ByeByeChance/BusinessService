import { SharedEntity } from '@src/shared/entities/base.entity';
import { Entity, Column } from 'typeorm';

@Entity('trainingRecord')
export class TrainingRecordEntity extends SharedEntity {
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
    comment: '任务状态 (0: 待训练, 1: 训练中, 2: 已完成, 3: 已取消, 4: 训练失败)',
    nullable: false,
  })
  status!: number;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'sampleGroupIds',
    comment: '样本组ID集合',
    nullable: false,
  })
  sampleGroupIds!: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'sampleGroupNames',
    comment: '样本组名称集合 (sampleGroup-1, sampleGroup-2, ...)',
    nullable: false,
  })
  sampleGroupNames!: string;

  @Column({
    type: 'varchar',
    length: 36,
    name: 'debugRecordId',
    comment: '训练调试记录ID (UUID)',
    nullable: false,
  })
  debugRecordId!: string;

  @Column({
    type: 'varchar',
    length: 36,
    name: 'imageId',
    comment: '训练镜像ID (UUID)',
    nullable: false,
  })
  imageId!: string;

  @Column({
    type: 'varchar',
    length: 36,
    name: 'imageName',
    comment: '训练镜像名称',
    nullable: false,
  })
  imageName!: string;

  @Column({
    type: 'varchar',
    length: 36,
    name: 'algorithmId',
    comment: '训练算法ID (UUID)',
    nullable: false,
  })
  algorithmId!: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'algorithmName',
    comment: '训练算法名称',
    nullable: false,
  })
  algorithmName!: string;

  @Column({
    type: 'text',
    name: 'description',
    nullable: true,
    comment: '任务描述',
  })
  description?: string;

  @Column({
    type: 'text',
    name: 'resultMessage',
    nullable: true,
    comment: '任务结果消息',
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
