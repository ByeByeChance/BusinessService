import { ApiProperty } from '@nestjs/swagger';
import { QueryOptionsPageDto } from '@src/shared/dto/query.options.dto';

export class QueryEvalRecordDto extends QueryOptionsPageDto {
  @ApiProperty({ description: '评测任务名称', required: false })
  name?: string;

  @ApiProperty({
    description: '评测状态 (0: 待评测, 1: 评测中, 2: 已完成, 3: 已取消, 4: 评测失败)',
    required: false,
    enum: [0, 1, 2, 3, 4],
  })
  status?: number;
}
