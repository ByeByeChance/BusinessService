import { ApiProperty } from '@nestjs/swagger';
import { BaseVo } from '@src/shared/vo/base.vo';

export class TrainingRecordVo extends BaseVo {
  @ApiProperty({ description: '训练任务名称' })
  name!: string;

  @ApiProperty({ description: '训练任务状态' })
  status!: number;

  @ApiProperty({ description: '训练任务所属样本组ID集合' })
  sampleGroupIds!: string;

  @ApiProperty({ description: '训练任务所属样本组名称集合' })
  sampleGroupNames!: string;

  @ApiProperty({ description: '调试记录ID' })
  debugRecordId!: string;

  @ApiProperty({ description: '训练任务所属训练镜像ID' })
  imageId!: string;

  @ApiProperty({ description: '训练任务所属训练镜像名称' })
  imageName!: string;

  @ApiProperty({ description: '训练任务所属算法ID' })
  algorithmId!: string;

  @ApiProperty({ description: '训练任务所属算法名称' })
  algorithmName!: string;

  @ApiProperty({ description: '训练任务描述' })
  description?: string;

  @ApiProperty({ description: '训练任务结果消息' })
  resultMessage?: string;
}
