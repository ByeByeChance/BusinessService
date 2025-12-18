import { SharedEntity } from '@src/shared/entities/base.entity';
import { Entity, Column } from 'typeorm';

@Entity('algorithm')
export class AlgorithmEntity extends SharedEntity {
  @Column({
    type: 'varchar',
    length: 100,
    name: 'name',
    comment: '算法名称',
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'version',
    comment: '算法版本',
  })
  version?: string;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'description',
    nullable: true,
    comment: '算法描述',
  })
  description?: string;

  @Column({
    type: 'varchar',
    length: 36,
    name: 'resourceId',
    comment: '资源ID',
  })
  resourceId!: string;

  @Column({
    type: 'varchar',
    length: 36,
    name: 'userId',
    comment: '用户ID (UUID)',
  })
  userId!: string;
}
