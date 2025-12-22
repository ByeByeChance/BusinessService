import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { RoleQueryDto } from './dto/role.query';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { RoleVo } from './vo/role.vo';
import { ResultListVo } from '@src/shared/vo/result.vo';
import { AuthGuard } from '@src/guard/auth.guard';
import { PermissionGuard } from '@src/guard/permission.guard';
import { RequirePermissions } from '@src/decorators/permission.decorator';

@ApiTags('角色模块')
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@Controller('/roleController')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({ summary: '获取角色列表' })
  @RequirePermissions('role:list')
  @Get('getRoleList')
  async getRoleListApi(@Query() queryOption: RoleQueryDto): Promise<ResultListVo<RoleVo>> {
    return await this.roleService.getRoleList(queryOption);
  }

  @ApiOperation({ summary: '创建角色' })
  @RequirePermissions('role:create')
  @Post('createRole')
  async createRoleApi(@Body() createRoleDto: CreateRoleDto): Promise<string> {
    return await this.roleService.createRole(createRoleDto);
  }

  @ApiOperation({ summary: '更新角色' })
  @RequirePermissions('role:update')
  @Post('updateRole')
  async updateRoleApi(@Body() req: { id: string; data: UpdateRoleDto }): Promise<string> {
    return await this.roleService.updateRole(req.id, req.data);
  }

  @ApiOperation({ summary: '删除角色' })
  @RequirePermissions('role:delete')
  @Post('deleteRole')
  async deleteRoleApi(@Body() req: { id: string }): Promise<string> {
    return await this.roleService.deleteRole(req.id);
  }

  @ApiOperation({ summary: '获取角色详情' })
  @RequirePermissions('role:detail')
  @Get('getRoleById')
  async getRoleByIdApi(@Query('id') id: string): Promise<RoleVo> {
    return await this.roleService.getRoleById(id);
  }

  @ApiOperation({ summary: '分配菜单权限' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        roleId: {
          type: 'string',
          description: '角色ID',
        },
        menuIds: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: '菜单ID列表',
        },
      },
    },
  })
  @RequirePermissions('role:assignMenus')
  @Post('assignMenus')
  async assignMenusApi(@Body() req: { roleId: string; menuIds: string[] }): Promise<string> {
    return await this.roleService.assignMenusToRole(req.roleId, req.menuIds);
  }

  @ApiOperation({ summary: '获取所有角色（用于下拉选择）' })
  @RequirePermissions('role:list')
  @Get('getAllRoles')
  async getAllRolesApi(): Promise<RoleVo[]> {
    return await this.roleService.getAllRoles();
  }
}
