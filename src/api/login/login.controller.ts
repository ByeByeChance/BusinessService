import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto, LogoutDto, RefreshTokenDto } from './dto/login.dto';
import { LoginService } from './login.service';
import { LoginVo } from './vo/login.vo';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('登录模块')
@Controller()
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @ApiOperation({ summary: '登录' })
  @Post('login')
  async loginApi(@Body() req: LoginDto): Promise<LoginVo | null> {
    return await this.loginService.loginApi(req);
  }

  @ApiOperation({ summary: '登出' })
  @Post('logout')
  async logoutApi(@Body() req: LogoutDto): Promise<boolean> {
    return await this.loginService.logoutApi(req);
  }

  @ApiOperation({ summary: '刷新令牌' })
  @Post('refreshToken')
  async refreshTokenApi(@Body() req: RefreshTokenDto): Promise<LoginVo> {
    return await this.loginService.refreshTokenApi(req);
  }
}
