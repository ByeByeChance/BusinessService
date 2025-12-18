import { ApiProperty } from '@nestjs/swagger';
import { BaseVo } from '@src/shared/vo/base.vo';

export class SampleItemVo extends BaseVo {
  @ApiProperty({ description: '样本名称' })
  name!: string;

  @ApiProperty({ description: '文件路径' })
  path!: string;

  @ApiProperty({ description: '文件大小（字节）' })
  size!: number;

  @ApiProperty({ description: '描述' })
  description?: string;
}
