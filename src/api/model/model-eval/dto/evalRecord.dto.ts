import { ApiProperty } from '@nestjs/swagger';

export class EvalRecordDto {
  @ApiProperty({ description: '评测任务名称' })
  name!: string;

  @ApiProperty({
    description: '评测状态 (0: 待评测, 1: 评测中, 2: 已完成, 3: 已取消, 4: 评测失败)',
    enum: [0, 1, 2, 3, 4],
    required: false,
  })
  status?: number;

  @ApiProperty({ description: '评分', required: false })
  score?: number;

  @ApiProperty({ description: '样本组ID集合' })
  sampleGroupIds!: string;

  @ApiProperty({ description: '评测镜像ID' })
  imageId!: string;

  @ApiProperty({ description: '评测算法ID' })
  algorithmId!: string;

  @ApiProperty({ description: '评测调试记录ID' })
  debugRecordId!: string;

  @ApiProperty({ description: '评测描述', required: false })
  description?: string;

  @ApiProperty({ description: '开始时间', required: false })
  startTime?: string;

  @ApiProperty({ description: '结束时间', required: false })
  endTime?: string;

  @ApiProperty({ description: '持续时间', required: false })
  duration?: number;

  @ApiProperty({ description: '指标数据', required: false })
  metrics?: string;
}
