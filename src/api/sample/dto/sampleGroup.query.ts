import { ApiProperty } from '@nestjs/swagger';
import { QueryOptionsPageDto } from '@src/shared/dto/query.options.dto';
import { SampleGroupTag } from '../entities/sampleGroup.entity';

export class QuerySampleGroupDto extends QueryOptionsPageDto {
  @ApiProperty({ description: '数据集名称', required: false })
  name?: string;

  @ApiProperty({ description: '用户ID', required: false })
  userId?: string;

  @ApiProperty({
    description: '数据集标签',
    required: false,
    enum: ['debug_training', 'debug_evaluation', 'training', 'evaluation'],
  })
  tag?: SampleGroupTag;
}
