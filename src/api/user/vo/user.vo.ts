import { ApiProperty } from '@nestjs/swagger';
import { BaseVo } from '@src/shared/vo/base.vo';

export class UserVo extends BaseVo {
  @ApiProperty({ description: '账号' })
  username!: string;

  @ApiProperty({ description: '邮箱' })
  email?: string;

  @ApiProperty({ description: '账号状态' })
  status!: number;

  @ApiProperty({ description: '角色ID' })
  roleId?: string;

  @ApiProperty({ description: '最后登录时间' })
  lastLoginDate?: Date;
}
