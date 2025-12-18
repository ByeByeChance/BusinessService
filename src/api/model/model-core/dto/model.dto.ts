import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ModelDto {
  @ApiProperty({ description: '模型名称', required: true })
  @IsNotEmpty({ message: '模型名称不能为空' })
  name!: string;

  @ApiProperty({ description: '模型大小', required: true })
  @IsNotEmpty({ message: '模型大小不能为空' })
  size!: number;

  @ApiProperty({ description: '模型路径', required: true })
  @IsNotEmpty({ message: '模型路径不能为空' })
  path!: string;

  @ApiProperty({ description: '模型状态', required: false })
  status?: number;

  @ApiProperty({ description: '模型评分', required: false })
  score?: number;

  @ApiProperty({ description: '模型最低评分', required: false })
  minScore?: number;

  @ApiProperty({ description: '模型最高评分', required: false })
  maxScore?: number;

  @ApiProperty({ description: '调试记录ID', required: true })
  @IsNotEmpty({ message: '调试记录ID不能为空' })
  debugRecordId!: string;

  @ApiProperty({ description: '描述', required: false })
  description?: string;
}
