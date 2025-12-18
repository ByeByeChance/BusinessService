import { ApiProperty } from '@nestjs/swagger';
import { ResourceType, ResourceStatus } from '../entities/resource.entity';
import { BaseVo } from '@src/shared/vo/base.vo';

export class ResourceVo extends BaseVo {
  @ApiProperty({ description: '文件名' })
  filename!: string;

  @ApiProperty({ description: '原始文件名' })
  originalFilename!: string;

  @ApiProperty({ description: '文件MIME类型' })
  mimeType?: string;

  @ApiProperty({ description: '文件大小（字节）' })
  size!: number;

  @ApiProperty({ description: '资源类型' })
  type!: ResourceType;

  @ApiProperty({ description: '资源状态' })
  status!: ResourceStatus;

  @ApiProperty({ description: '文件校验值' })
  etag?: string;

  @ApiProperty({ description: '上传文件的源地址' })
  filePath?: string;

  @ApiProperty({ description: '最终访问地址（解压缩后目录或直接访问地址）' })
  path?: string;

  @ApiProperty({ description: '分片大小（字节）' })
  chunkSize?: number;

  @ApiProperty({ description: '分片总数' })
  chunkTotal?: number;

  @ApiProperty({ description: '已上传分片索引列表' })
  chunkUploaded?: number[];

  @ApiProperty({ description: '失败原因' })
  failedReason?: string;

  @ApiProperty({ description: '文件MD5校验值' })
  md5?: string;

  @ApiProperty({ description: '存储地址' })
  storageUrl?: string;

  @ApiProperty({ description: '存储桶' })
  storageBucket?: string;

  @ApiProperty({ description: '存储键' })
  storageKey?: string;

  @ApiProperty({ description: '上传用户ID' })
  userId!: string;

  @ApiProperty({ description: '附加元数据' })
  metadata?: Record<string, any>;
}

export class UploadFileVo {
  @ApiProperty({ description: '资源ID' })
  resourceId!: string;

  @ApiProperty({ description: '存储地址', required: false })
  storageUrl?: string;

  @ApiProperty({ description: '存储桶', required: false })
  storageBucket?: string;

  @ApiProperty({ description: '存储键', required: false })
  storageKey?: string;
}

export class ResourceUploadInitVo {
  @ApiProperty({ description: '资源ID' })
  resourceId!: string;

  @ApiProperty({ description: '是否需要分片上传' })
  needChunkUpload!: boolean;

  @ApiProperty({ description: '分片大小（字节）', required: false })
  chunkSize?: number;

  @ApiProperty({ description: '分片总数', required: false })
  chunkTotal?: number;

  @ApiProperty({ description: '建议的上传URL', required: false })
  uploadUrl?: string;
}

export class ChunkUploadVo {
  @ApiProperty({ description: '资源ID' })
  resourceId!: string;

  @ApiProperty({ description: '分片索引' })
  chunkIndex!: number;

  @ApiProperty({ description: '是否上传成功' })
  uploaded!: boolean;

  @ApiProperty({ description: '已上传分片数量' })
  uploadedChunks!: number;

  @ApiProperty({ description: '总分片数量' })
  totalChunks!: number;

  @ApiProperty({ description: '是否所有分片都已上传完成' })
  allUploaded!: boolean;
}

export class MergeChunksVo {
  @ApiProperty({ description: '资源ID' })
  resourceId!: string;

  @ApiProperty({ description: '是否合并成功' })
  merged!: boolean;

  @ApiProperty({ description: '存储地址', required: false })
  storageUrl?: string;

  @ApiProperty({ description: '存储键', required: false })
  storageKey?: string;
}
