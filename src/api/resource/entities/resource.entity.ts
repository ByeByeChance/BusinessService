import { Column, Entity } from 'typeorm';
import { SharedEntity } from '@src/shared/entities/base.entity';

// 资源类型枚举
export const ResourceTypeEnum = {
  SAMPLE_GROUP: 'sample_group', // 样本组
  IMAGE: 'image', // 镜像
  ALGORITHM_PACKAGE: 'algorithm_package', // 算法包
  MODEL: 'model', // 模型文件
  PICTURE: 'picture', // 图片文件
  OTHER: 'other', // 其他
} as const;

export type ResourceType = (typeof ResourceTypeEnum)[keyof typeof ResourceTypeEnum];

// 资源状态枚举
export const ResourceStatusEnum = {
  INIT: 'init', // 初始化
  UPLOADING: 'uploading', // 上传中
  CHUNK_UPLOADING: 'chunk_uploading', // 分片上传中
  UPLOADED: 'uploaded', // 已上传
  MERGING: 'merging', // 合并中
  MERGED: 'merged', // 已合并
  DECOMPRESSING: 'decompressing', // 解压缩中
  DECOMPRESSED: 'decompressed', // 已解压缩
  STORED: 'stored', // 已存储
  FAILED: 'failed', // 失败
} as const;

export type ResourceStatus = (typeof ResourceStatusEnum)[keyof typeof ResourceStatusEnum];

@Entity('resource')
export class ResourceEntity extends SharedEntity {
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    name: 'filename',
    comment: '文件名',
  })
  filename!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    name: 'originalFilename',
    comment: '原始文件名',
  })
  originalFilename!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'mimeType',
    comment: '文件MIME类型',
  })
  mimeType?: string;

  @Column({
    type: 'bigint',
    nullable: false,
    name: 'size',
    comment: '文件大小（字节）',
  })
  size!: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'filePath',
    comment: '上传文件的源地址',
  })
  filePath?: string;

  @Column({
    type: 'varchar',
    length: 512,
    nullable: true,
    name: 'path',
    comment: '最终访问地址（解压缩后目录或直接访问地址）',
  })
  path?: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    default: ResourceStatusEnum.INIT,
    name: 'status',
    comment: '资源状态',
  })
  status!: ResourceStatus;

  @Column({
    type: 'enum',
    enum: ResourceTypeEnum,
    nullable: false,
    default: ResourceTypeEnum.OTHER,
    name: 'type',
    comment: '资源类型',
  })
  type!: ResourceType;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'etag',
    comment: '文件校验值（MD5/SHA1等）',
  })
  etag?: string;

  @Column({
    type: 'bigint',
    nullable: true,
    name: 'chunkSize',
    comment: '分片大小（字节）',
  })
  chunkSize?: number;

  @Column({
    type: 'int',
    nullable: true,
    name: 'chunkTotal',
    comment: '分片总数',
  })
  chunkTotal?: number;

  @Column({
    type: 'json',
    nullable: true,
    name: 'chunkUploaded',
    comment: '已上传分片索引列表',
  })
  chunkUploaded?: number[];

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'failedReason',
    comment: '失败原因',
  })
  failedReason?: string;

  @Column({
    type: 'varchar',
    length: 36,
    nullable: false,
    name: 'userId',
    comment: '上传用户ID',
  })
  userId!: string;

  @Column({
    type: 'json',
    nullable: true,
    name: 'metadata',
    comment: '附加元数据',
  })
  metadata?: Record<string, any>;

  @Column({
    type: 'varchar',
    length: 64,
    nullable: true,
    name: 'md5',
    comment: '文件MD5校验值',
  })
  md5?: string;
}
