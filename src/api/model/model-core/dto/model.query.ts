import { ApiProperty } from '@nestjs/swagger';
import { QueryOptionsPageDto } from '@src/shared/dto/query.options.dto';

export class QueryModelDto extends QueryOptionsPageDto {
  @ApiProperty({ description: '模型名称', required: false })
  name?: string;

  @ApiProperty({ description: '模型状态', required: false })
  status?: number;
}
