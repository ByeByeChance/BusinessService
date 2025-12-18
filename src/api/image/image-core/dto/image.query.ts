import { ApiProperty } from '@nestjs/swagger';
import { QueryOptionsPageDto } from '@src/shared/dto/query.options.dto';

export class QueryImageDto extends QueryOptionsPageDto {
  @ApiProperty({ description: '镜像名称', required: false })
  name?: string;
}
