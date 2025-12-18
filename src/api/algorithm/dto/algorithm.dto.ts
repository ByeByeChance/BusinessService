import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class AlgorithmDto {
  @ApiProperty({ description: '算法名称', default: '示例算法' })
  @MaxLength(100, { message: '算法名称最大长度为100' })
  @IsNotEmpty({ message: '算法名称不能为空' })
  name!: string;

  @ApiProperty({ description: '算法版本', default: '1.0.0' })
  @MaxLength(50, { message: '算法版本最大长度为50' })
  version?: string;

  @ApiProperty({ description: '资源ID', default: '' })
  @IsNotEmpty({ message: '资源ID不能为空' })
  resourceId!: string;

  @ApiProperty({ description: '算法描述', required: false, default: '这是一个算法描述' })
  @MaxLength(500, { message: '算法描述最大长度为500' })
  description?: string;

  @ApiProperty({ description: '用户ID', default: '1' })
  @IsNotEmpty({ message: '用户ID不能为空' })
  userId!: string;
}
