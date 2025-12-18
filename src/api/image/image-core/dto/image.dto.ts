import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ImageDto {
  @ApiProperty({ description: '镜像名称', required: true })
  @IsNotEmpty({ message: '镜像名称不能为空' })
  name!: string;

  @ApiProperty({ description: '描述', required: false })
  description?: string;

  @ApiProperty({ description: '资源ID', required: true })
  @IsNotEmpty({ message: '资源ID不能为空' })
  resourceId!: string;
}
