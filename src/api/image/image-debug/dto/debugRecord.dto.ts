import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export const DebugTypeEnum = {
  training: '训练调试',
  evaluation: '评测调试',
} as const;

export type DebugType = keyof typeof DebugTypeEnum;

export class DebugRecordDto {
  @ApiProperty({ description: '任务名称', required: true })
  @IsNotEmpty({ message: '任务名称不能为空' })
  name!: string;

  @ApiProperty({ description: '调试类型', required: true })
  @IsNotEmpty({ message: '调试类型不能为空' })
  type!: DebugType;

  @ApiProperty({ description: '评测镜像ID', required: true })
  @IsNotEmpty({ message: '评测镜像ID不能为空' })
  imageId!: string;

  @ApiProperty({ description: '算法ID', required: true })
  @IsNotEmpty({ message: '算法ID不能为空' })
  algorithmId!: string;

  @ApiProperty({ description: '样本组ID', required: true })
  @IsNotEmpty({ message: '样本组ID不能为空' })
  sampleGroupIds!: string;

  @ApiProperty({ description: '模型ID', required: false })
  modelId?: string;

  @ApiProperty({ description: '描述', required: false })
  description?: string;
}
