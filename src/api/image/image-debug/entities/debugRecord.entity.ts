import { SharedEntity } from '@src/shared/entities/base.entity';
import { Entity, Column } from 'typeorm';
import { DebugType } from '../dto/debugRecord.dto';

@Entity('debugRecord')
export class DebugRecordEntity extends SharedEntity {
  @Column({
    type: 'varchar',
    length: 255,
    name: 'name',
    comment: '任务名称',
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'type',
    comment: '任务类型',
    nullable: false,
  })
  type!: DebugType;

  @Column({
    type: 'int',
    name: 'status',
    comment: '状态 (0: 待开始, 1: 进行中, 2: 已完成, 3: 失败)',
    default: 0,
    nullable: false,
  })
  status!: number;

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
    name: 'modelId',
    comment: '模型ID',
    nullable: true,
  })
  modelId?: string;

  @Column({
    type: 'varchar',
    length: 36,
    name: 'modelName',
    comment: '模型名称',
    nullable: true,
  })
  modelName?: string;

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
    type: 'varchar',
    length: 36,
    name: 'userId',
    comment: '用户ID',
  })
  userId!: string;
}
