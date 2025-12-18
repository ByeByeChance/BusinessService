import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { SampleGroupTag } from '../entities/sampleGroup.entity';

export class SampleGroupDto {
  @ApiProperty({ description: '数据集名称', required: true })
  @IsNotEmpty({ message: '数据集名称不能为空' })
  name!: string;

  @ApiProperty({
    description: '数据集标签',
    required: true,
    enum: ['debug_training', 'debug_evaluation', 'training', 'evaluation'],
  })
  @IsNotEmpty({ message: '数据集标签不能为空' })
  tag!: SampleGroupTag;

  @ApiProperty({ description: '描述', required: false })
  description?: string;

  @ApiProperty({ description: '资源ID', required: true })
  @IsNotEmpty({ message: '资源ID不能为空' })
  resourceId!: string;
}
