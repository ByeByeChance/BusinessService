import { ApiProperty } from '@nestjs/swagger';
import { BaseVo } from '@src/shared/vo/base.vo';

export class ImageVo extends BaseVo {
  @ApiProperty({ description: '镜像名称' })
  name!: string;

  @ApiProperty({ description: '文件大小（字节）' })
  size!: number;

  @ApiProperty({ description: '资源ID' })
  resourceId!: string;

  @ApiProperty({ description: '资源路径' })
  resourcePath?: string;

  @ApiProperty({ description: '描述' })
  description?: string;

  @ApiProperty({ description: '上传用户' })
  username?: string;
}
