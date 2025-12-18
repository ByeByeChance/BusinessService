import { ApiProperty } from '@nestjs/swagger';
import { QueryOptionsPageDto } from '@src/shared/dto/query.options.dto';

export class RoleQueryDto extends QueryOptionsPageDto {
  @ApiProperty({ description: '角色名称', required: false })
  name?: string;

  @ApiProperty({ description: '角色状态', required: false })
  status?: number;
}
