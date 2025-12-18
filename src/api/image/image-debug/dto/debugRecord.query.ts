import { ApiProperty } from '@nestjs/swagger';
import { QueryOptionsPageDto } from '@src/shared/dto/query.options.dto';
import { DebugType } from './debugRecord.dto';

export class QueryDebugRecordDto extends QueryOptionsPageDto {
  @ApiProperty({ description: '任务名称', required: false })
  name?: string;

  @ApiProperty({ description: '调试类型', required: false })
  type?: DebugType;

  @ApiProperty({ description: '状态', required: false })
  status?: number;
}
