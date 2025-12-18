import { ApiProperty } from '@nestjs/swagger';
import { BaseVo } from '@src/shared/vo/base.vo';
import { SampleGroupTag } from '../entities/sampleGroup.entity';

export class SampleGroupItemVo extends BaseVo {
  @ApiProperty({ description: '数据集名称' })
  name!: string;

  @ApiProperty({
    description: '数据集标签',
    enum: ['debug_training', 'debug_evaluation', 'training', 'evaluation'],
  })
  tag!: SampleGroupTag;

  @ApiProperty({ description: '样本数量' })
  sampleCount!: number;

  @ApiProperty({ description: '描述' })
  description?: string;

  @ApiProperty({ description: '资源ID' })
  resourceId!: string;

  @ApiProperty({ description: '资源路径' })
  resourcePath?: string;

  @ApiProperty({ description: '用户ID' })
  userId!: string;
}
