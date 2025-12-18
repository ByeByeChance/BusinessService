import { ApiProperty } from '@nestjs/swagger';
import { BaseVo } from '@src/shared/vo/base.vo';

export class AlgorithmItem extends BaseVo {
  @ApiProperty({ description: '算法名称' })
  name!: string;

  @ApiProperty({ description: '算法版本' })
  version?: string;

  @ApiProperty({ description: '资源ID' })
  resourceId!: string;

  @ApiProperty({ description: '资源路径' })
  resourcePath?: string;

  @ApiProperty({ description: '算法描述' })
  description?: string;

  @ApiProperty({ description: '用户ID' })
  userId!: string;
}
