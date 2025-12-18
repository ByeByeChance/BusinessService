import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class QueryOptionsDto {
  @ApiProperty({ description: 'ID', required: false })
  id?: string;
  @ApiProperty({ description: '创建时间开始', required: false })
  createdTimeStart?: string;
  @ApiProperty({ description: '创建时间结束', required: false })
  createdTimeEnd?: string;
  @ApiProperty({ description: '更新时间开始', required: false })
  updatedTimeStart?: string;
  @ApiProperty({ description: '更新时间结束', required: false })
  updatedTimeEnd?: string;
}

export class QueryOptionsPageDto extends QueryOptionsDto {
  @ApiProperty({ description: '分页大小', required: false })
  @Min(10, { message: 'pageSize最小值为10' })
  @IsInt({ message: 'pageSize必须是数字' })
  @Type(() => Number)
  @IsOptional()
  pageSize?: number = 10;

  @ApiProperty({ description: '当前页', required: false })
  @Min(1, { message: 'current最小值为1' })
  @IsInt({ message: 'current必须是数字' })
  @Type(() => Number)
  @IsOptional()
  current?: number = 1;
}
