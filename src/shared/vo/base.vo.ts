import { ApiProperty } from '@nestjs/swagger';

export class BaseVo {
  @ApiProperty({ description: 'ID' })
  id!: string;

  @ApiProperty({ description: '创建时间' })
  createdTime!: Date;

  @ApiProperty({ description: '更新时间' })
  updatedTime?: Date;

  @ApiProperty({ description: '删除时间' })
  deletedTime?: Date;
}
