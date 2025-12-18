import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsNumber, IsString, IsEnum } from 'class-validator';
import {
  ResourceType,
  ResourceTypeEnum,
  ResourceStatus,
  ResourceStatusEnum,
} from '../entities/resource.entity';

export class ResourceDto {
  @ApiProperty({ description: '原始文件名', required: true })
  @IsNotEmpty({ message: '原始文件名不能为空' })
  originalFilename!: string;

  @ApiProperty({ description: '文件MIME类型', required: false })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiProperty({ description: '文件大小（字节）', required: true })
  @IsNotEmpty({ message: '文件大小不能为空' })
  @IsNumber({}, { message: '文件大小必须是数字' })
  size!: number;

  @ApiProperty({ description: '资源类型', required: true, enum: Object.keys(ResourceTypeEnum) })
  @IsNotEmpty({ message: '资源类型不能为空' })
  @IsEnum(ResourceTypeEnum, {
    message: `资源类型必须是${Object.keys(ResourceTypeEnum).join(', ')}之一`,
  })
  type!: ResourceType;

  @ApiProperty({ description: '文件校验值', required: false })
  @IsOptional()
  @IsString()
  etag?: string;

  @ApiProperty({ description: '附加元数据', required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class ChunkUploadDto {
  @ApiProperty({ description: '资源ID', required: true })
  @IsNotEmpty({ message: '资源ID不能为空' })
  resourceId!: string;

  @ApiProperty({ description: '分片索引', required: true })
  @IsNotEmpty({ message: '分片索引不能为空' })
  @IsNumber({}, { message: '分片索引必须是数字' })
  chunkIndex!: number;

  @ApiProperty({ description: '分片数据', required: true, type: 'file' })
  chunkFile!: Express.Multer.File;

  @ApiProperty({ description: '分片大小', required: true })
  @IsNotEmpty({ message: '分片大小不能为空' })
  @IsNumber({}, { message: '分片大小必须是数字' })
  chunkSize!: number;
}

export class MergeChunksDto {
  @ApiProperty({ description: '资源ID', required: true })
  @IsNotEmpty({ message: '资源ID不能为空' })
  resourceId!: string;
}

export class UpdateResourceStatusDto {
  @ApiProperty({ description: '资源ID', required: true })
  @IsNotEmpty({ message: '资源ID不能为空' })
  resourceId!: string;

  @ApiProperty({ description: '资源状态', required: true, enum: Object.keys(ResourceStatusEnum) })
  @IsNotEmpty({ message: '资源状态不能为空' })
  @IsEnum(ResourceStatusEnum, {
    message: `资源状态必须是${Object.keys(ResourceStatusEnum).join(', ')}之一`,
  })
  status!: ResourceStatus;

  @ApiProperty({ description: '失败原因', required: false })
  @IsOptional()
  @IsString()
  failedReason?: string;
}
