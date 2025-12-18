import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, MaxLength, MinLength, IsInt } from 'class-validator';

export class UserDto {
  @ApiProperty({ description: '用户名', default: 'user' })
  @MaxLength(50, { message: '用户名最大长度为50' })
  @IsNotEmpty({ message: '用户名不能为空' })
  username!: string;

  @ApiProperty({ description: '密码', default: '123456789' })
  @MinLength(8, { message: '密码最小长度为8位数' })
  @IsNotEmpty({ message: '密码不能为空' })
  password!: string;

  @ApiProperty({ description: '邮箱', required: false, default: '123456789@qq.com' })
  @IsEmail()
  email?: string;

  @ApiProperty({ description: '账号状态', required: false, default: 1 })
  @IsInt({ message: '账号状态只能为数字' })
  status!: number;

  @ApiProperty({ description: '角色ID', required: true, default: '' })
  roleId?: string;
}
