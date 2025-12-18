import { ApiProperty } from '@nestjs/swagger';
import { QueryOptionsPageDto } from '@src/shared/dto/query.options.dto';

export class QueryUserDto extends QueryOptionsPageDto {
  @ApiProperty({ description: '用户名', required: false })
  username?: string;

  @ApiProperty({ description: '状态', required: false })
  status?: number;
}
