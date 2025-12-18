import { QueryOptionsPageDto } from '@src/shared/dto/query.options.dto';
import { ApiProperty } from '@nestjs/swagger';

export class QueryMenuDto extends QueryOptionsPageDto {
  @ApiProperty({ description: '菜单标题', required: false })
  readonly title?: string;
  @ApiProperty({ description: '菜单路径', required: false })
  readonly path?: string;
}
