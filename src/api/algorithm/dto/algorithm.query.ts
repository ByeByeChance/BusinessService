import { ApiProperty } from '@nestjs/swagger';
import { QueryOptionsPageDto } from '@src/shared/dto/query.options.dto';

export class QueryAlgorithmDto extends QueryOptionsPageDto {
  @ApiProperty({ description: '算法名称', required: false })
  name?: string;

  @ApiProperty({ description: '用户ID', required: false })
  userId?: string;
}
