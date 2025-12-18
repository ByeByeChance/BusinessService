import { SharedEntity } from '@src/shared/entities/base.entity';
import { Entity, Column } from 'typeorm';

@Entity('model')
export class ModelEntity extends SharedEntity {
  @Column({
    type: 'varchar',
    length: 255,
    name: 'name',
    comment: '模型名称',
  })
  name!: string;

  @Column({
    type: 'bigint',
    name: 'size',
    comment: '文件大小（字节）',
  })
  size!: number;

  @Column({
    type: 'int',
    name: 'status',
    comment: '模型状态',
    nullable: true,
  })
  status?: number;

  @Column({
    type: 'float',
    name: 'score',
    comment: '最新模型评分',
    nullable: true,
  })
  score?: number;

  @Column({
    type: 'float',
    name: 'minScore',
    comment: '最低模型评分',
    nullable: true,
  })
  minScore?: number;

  @Column({
    type: 'float',
    name: 'maxScore',
    comment: '最高模型评分',
    nullable: true,
  })
  maxScore?: number;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'path',
    comment: '文件路径',
  })
  path!: string;

  @Column({
    type: 'text',
    name: 'description',
    nullable: true,
    comment: '模型描述',
  })
  description?: string;

  @Column({
    type: 'varchar',
    length: 36,
    name: 'debugRecordId',
    comment: '调试记录ID',
    nullable: false,
  })
  debugRecordId!: string;
}
