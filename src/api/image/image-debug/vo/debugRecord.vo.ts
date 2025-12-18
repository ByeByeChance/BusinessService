import { ApiProperty } from '@nestjs/swagger';
import { BaseVo } from '@src/shared/vo/base.vo';
import { DebugType } from '../dto/debugRecord.dto';

export class DebugRecordVo extends BaseVo {
  @ApiProperty({ description: '任务名称' })
  name!: string;

  @ApiProperty({ description: '调试类型' })
  type!: DebugType;

  @ApiProperty({ description: '状态' })
  status!: number;

  @ApiProperty({ description: '算法ID' })
  algorithmId!: string;

  @ApiProperty({ description: '算法名称' })
  algorithmName!: string;

  @ApiProperty({ description: '样本组ID' })
  sampleGroupIds!: string;

  @ApiProperty({ description: '样本组名称' })
  sampleGroupNames!: string;

  @ApiProperty({ description: '模型ID' })
  modelId?: string;

  @ApiProperty({ description: '模型名称' })
  modelName?: string;

  @ApiProperty({ description: '描述' })
  description?: string;

  @ApiProperty({ description: '操作人' })
  username?: string;
}
