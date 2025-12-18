import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BaseEntity,
} from 'typeorm';

export class SharedEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    comment: '主键id (UUID)',
  })
  id!: string;

  @CreateDateColumn({
    nullable: false,
    name: 'createdTime',
    comment: '创建时间',
  })
  createdTime!: Date;

  @UpdateDateColumn({
    nullable: true,
    name: 'updatedTime',
    comment: '更新时间',
  })
  updatedTime?: Date;

  @DeleteDateColumn({
    nullable: true,
    name: 'deletedTime',
    select: false,
    comment: '软删除时间',
  })
  deletedTime?: Date;
}
