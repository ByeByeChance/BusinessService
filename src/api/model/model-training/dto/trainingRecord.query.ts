import { ApiProperty } from '@nestjs/swagger';
import { QueryOptionsPageDto } from '@src/shared/dto/query.options.dto';

export class QueryTrainingRecordDto extends QueryOptionsPageDto {
  @ApiProperty({ description: '训练任务名称', required: false })
  name?: string;

  @ApiProperty({
    description: '训练任务状态 (0: 待训练, 1: 训练中, 2: 已完成, 3: 已取消, 4: 训练失败)',
    required: false,
    enum: [0, 1, 2, 3, 4],
  })
  status?: number;
}
