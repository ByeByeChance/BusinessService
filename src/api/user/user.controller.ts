import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { QueryUserDto } from './dto/user.query';
import { UserVo } from './vo/user.vo';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResultListVo } from '@src/shared/vo/result.vo';
import { AuthGuard } from '@src/guard/auth.guard';
import { PermissionGuard } from '@src/guard/permission.guard';
import { RequirePermissions } from '@src/decorators/permission.decorator';
import { CurrentUser } from '@src/decorators';
import { UserEntity } from './entities/user.entity';

@ApiTags('用户模块')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('/userController')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '获取用户列表' })
  @Get('getUserList')
  async getUserListApi(@Query() queryOption: QueryUserDto): Promise<ResultListVo<UserVo>> {
    return await this.userService.getUserList(queryOption);
  }

  @ApiOperation({ summary: '添加用户' })
  @UseGuards(PermissionGuard)
  @RequirePermissions('user:add')
  @Post('addUser')
  async addUserApi(@Body() req: UserDto): Promise<string> {
    return await this.userService.addUser(req);
  }

  @ApiOperation({ summary: '根据用户id删除用户' })
  @UseGuards(PermissionGuard)
  @RequirePermissions('user:delete')
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
    @Body() req: { id: string; oldPassword: string; newPassword: string },
    @CurrentUser() user: UserEntity
  ): Promise<string> {
    return await this.userService.updatePassword(user, req.id, req.oldPassword, req.newPassword);
  }
}
