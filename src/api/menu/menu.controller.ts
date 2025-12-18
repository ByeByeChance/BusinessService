import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { QueryMenuDto } from './dto/menu.query';
import { ResultListVo } from '@src/shared/vo/result.vo';
import { MenuItemVo } from './vo/menu.vo';
import { MenuService } from './menu.service';
import { MenuDto } from './dto/menu.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('菜单模块')
@Controller('/menuController')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @ApiOperation({ summary: '获取菜单列表' })
  @Get('getMenuList')
  async getUserListApi(@Query() queryOption: QueryMenuDto): Promise<ResultListVo<MenuItemVo>> {
    return await this.menuService.getMenuList(queryOption);
  }

  @ApiOperation({ summary: '添加菜单' })
  @Post('addMenu')
  async addMenuApi(@Body() req: MenuDto): Promise<string> {
    return await this.menuService.addMenu(req);
  }

  @ApiOperation({ summary: '更新菜单' })
  @Post('updateMenu')
  async updateMenuApi(@Body() req: MenuDto): Promise<string> {
    return await this.menuService.updateMenu(req);
  }

  @ApiOperation({ summary: '根据菜单id删除菜单' })
  @Delete('deleteMenuById/:id')
  async deleteMenuByIdApi(@Param('id') id: string): Promise<string> {
    return await this.menuService.deleteMenuById(id);
  }
}
