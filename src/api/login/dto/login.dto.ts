import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: '用户名', default: 'user' })
  @IsString({ message: '用户名必须为字符类型' })
  @IsNotEmpty({ message: '用户名不能为空' })
  readonly username!: string;

  @ApiProperty({ description: '密码', default: '123456789' })
  @IsString({ message: '密码必须为字符串类型' })
  @Length(6, 12, { message: '密码长度必须是6-12位的' })
  readonly password!: string;

  // @IsNotEmpty({ message: '验证码不能空' })
  // readonly captcha!: string;

  // @IsNotEmpty({ message: '验证码不能为空' })
  // readonly codeText!: string;
}

export class LogoutDto {
  @ApiProperty({ description: '用户id' })
  @IsString({ message: '用户id必须为字符类型' })
  @IsNotEmpty({ message: '用户id不能为空' })
  readonly id!: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: '刷新令牌' })
  @IsString({ message: '刷新令牌必须为字符类型' })
  @IsNotEmpty({ message: '刷新令牌不能为空' })
  readonly refreshToken!: string;
}
