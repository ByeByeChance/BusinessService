import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { QueryUserDto } from './dto/user.query';
import { UserVo } from './vo/user.vo';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResultListVo } from '@src/shared/vo/result.vo';

@ApiTags('用户模块')
@Controller('/userController')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '获取用户列表' })
  @Get('getUserList')
  async getUserListApi(@Query() queryOption: QueryUserDto): Promise<ResultListVo<UserVo>> {
    return await this.userService.getUserList(queryOption);
  }

  @ApiOperation({ summary: '添加用户' })
  @Post('addUser')
  async addUserApi(@Body() req: UserDto): Promise<string> {
    return await this.userService.addUser(req);
  }

  @ApiOperation({ summary: '根据用户id删除用户' })
  @Post('deleteUserById')
  async deleteUserByIdApi(@Body() req: { id: string }): Promise<string> {
    return await this.userService.deleteUserById(req.id);
  }

  @ApiOperation({ summary: '修改用户信息' })
  @Post('updateUser')
  async updateUserApi(@Body() req: { id: string; data: Partial<UserDto> }): Promise<string> {
    return await this.userService.updateUser(req.id, req.data);
  }

  @ApiOperation({ summary: '修改用户密码' })
  @Post('updatePassword')
  async updatePasswordApi(
    @Body() req: { id: string; oldPassword: string; newPassword: string }
  ): Promise<string> {
    return await this.userService.updatePassword(req.id, req.oldPassword, req.newPassword);
  }
}
