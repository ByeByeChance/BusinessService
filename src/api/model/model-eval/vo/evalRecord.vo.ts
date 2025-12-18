import { ApiProperty } from '@nestjs/swagger';
import { BaseVo } from '@src/shared/vo/base.vo';

export class EvalRecordVo extends BaseVo {
  @ApiProperty({ description: '评测任务名称' })
  name!: string;

  @ApiProperty({ description: '评测任务状态' })
  status!: number;

  @ApiProperty({ description: '评测分数' })
  score?: number;

  @ApiProperty({ description: '评测任务所属样本组ID集合' })
  sampleGroupIds!: string;

  @ApiProperty({ description: '评测任务所属样本组名称集合' })
  sampleGroupNames!: string;

  @ApiProperty({ description: '调试记录ID' })
  debugRecordId!: string;

  @ApiProperty({ description: '评测任务所属训练镜像ID' })
  imageId!: string;

  @ApiProperty({ description: '评测任务所属训练镜像名称' })
  imageName!: string;

  @ApiProperty({ description: '评测任务所属算法ID' })
  algorithmId!: string;

  @ApiProperty({ description: '评测任务所属算法名称' })
  algorithmName!: string;

  @ApiProperty({ description: '评测任务所属模型ID' })
  modelId?: string;

  @ApiProperty({ description: '评测任务所属模型名称' })
  modelName?: string;

  @ApiProperty({ description: '评测任务描述' })
  description?: string;

  @ApiProperty({ description: '评测任务结果消息' })
  resultMessage?: string;
}
