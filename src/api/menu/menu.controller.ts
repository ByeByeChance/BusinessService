import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ResultListVo } from '@src/shared/vo/result.vo';
import { MenuItemVo } from './vo/menu.vo';
import { MenuService } from './menu.service';
import { MenuDto } from './dto/menu.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@src/guard/auth.guard';
import { PermissionGuard } from '@src/guard/permission.guard';
import { RequireRoles } from '@src/decorators/permission.decorator';
import { CurrentUser, ICurrentUserType } from '@src/decorators';

@ApiTags('菜单模块')
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@Controller('/menuController')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @ApiOperation({ summary: '获取菜单列表' })
  @Get('getMenuList')
  async getMenuListApi(@CurrentUser() user: ICurrentUserType): Promise<ResultListVo<MenuItemVo>> {
    return await this.menuService.getMenuList(user);
  }

  @ApiOperation({ summary: '添加菜单' })
  @RequireRoles('admin')
  @Post('addMenu')
  async addMenuApi(@Body() req: MenuDto): Promise<string> {
    return await this.menuService.addMenu(req);
  }

  @ApiOperation({ summary: '更新菜单' })
  @RequireRoles('admin')
  @Post('updateMenu')
  async updateMenuApi(@Body() req: MenuDto): Promise<string> {
    return await this.menuService.updateMenu(req);
  }

  @ApiOperation({ summary: '根据菜单id删除菜单' })
  @RequireRoles('admin')
  @Delete('deleteMenuById/:id')
  async deleteMenuByIdApi(@Param('id') id: string): Promise<string> {
    return await this.menuService.deleteMenuById(id);
  }
}
