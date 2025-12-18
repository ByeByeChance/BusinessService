import { ApiProperty } from '@nestjs/swagger';
import { QueryOptionsPageDto } from '@src/shared/dto/query.options.dto';

export class QuerySampleDto extends QueryOptionsPageDto {
  @ApiProperty({ description: '样本名称', required: false })
  name?: string;

  @ApiProperty({ description: '样本分组ID', required: false })
  groupId?: string;
}
