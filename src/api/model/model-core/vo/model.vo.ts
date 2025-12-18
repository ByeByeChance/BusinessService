import { ApiProperty } from '@nestjs/swagger';
import { BaseVo } from '@src/shared/vo/base.vo';

export class ModelVo extends BaseVo {
  @ApiProperty({ description: '模型名称' })
  name!: string;

  @ApiProperty({ description: '文件大小（字节）' })
  size!: number;

  @ApiProperty({ description: '模型状态' })
  status?: number;

  @ApiProperty({ description: '模型最新评分' })
  score?: number;

  @ApiProperty({ description: '模型最低评分' })
  minScore?: number;

  @ApiProperty({ description: '模型最高评分' })
  maxScore?: number;

  @ApiProperty({ description: '文件路径' })
  path!: string;

  @ApiProperty({ description: '调试记录ID' })
  debugRecordId!: string;
}
