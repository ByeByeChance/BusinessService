import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { QueryOptionsPageDto } from '@src/shared/dto/query.options.dto';
import {
  ResourceType,
  ResourceTypeEnum,
  ResourceStatus,
  ResourceStatusEnum,
} from '../entities/resource.entity';

export class QueryResourceDto extends QueryOptionsPageDto {
  @ApiProperty({ description: '文件名', required: false })
  @IsOptional()
  @IsString()
  filename?: string;

  @ApiProperty({ description: '原始文件名', required: false })
  @IsOptional()
  @IsString()
  originalFilename?: string;

  @ApiProperty({ description: '资源类型', required: false, enum: Object.keys(ResourceTypeEnum) })
  @IsOptional()
  @IsEnum(ResourceTypeEnum, {
    message: `资源类型必须是${Object.keys(ResourceTypeEnum).join(', ')}之一`,
  })
  type?: ResourceType;

  @ApiProperty({ description: '资源状态', required: false, enum: Object.keys(ResourceStatusEnum) })
  @IsOptional()
  @IsEnum(ResourceStatusEnum, {
    message: `资源状态必须是${Object.keys(ResourceStatusEnum).join(', ')}之一`,
  })
  status?: ResourceStatus;

  @ApiProperty({ description: '文件大小最小值（字节）', required: false })
  @IsOptional()
  @IsNumber({}, { message: '文件大小最小值必须是数字' })
  minSize?: number;

  @ApiProperty({ description: '文件大小最大值（字节）', required: false })
  @IsOptional()
  @IsNumber({}, { message: '文件大小最大值必须是数字' })
  maxSize?: number;

  @ApiProperty({ description: '上传用户ID', required: false })
  @IsOptional()
  @IsString()
  userId?: string;
}
