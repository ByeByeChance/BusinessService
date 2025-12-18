import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称', example: 'admin' })
  name!: string;

  @ApiProperty({ description: '角色描述', example: '系统管理员' })
  description?: string;

  @ApiProperty({ description: '状态', example: 1 })
  status!: number;

  @ApiProperty({ description: '排序', example: 1 })
  sort!: number;

  @ApiProperty({ description: '菜单ID列表', example: ['1', '2', '3'] })
  menuIds?: string[];
}

export class UpdateRoleDto {
  @ApiProperty({ description: '角色名称', example: 'admin' })
  name?: string;

  @ApiProperty({ description: '角色描述', example: '系统管理员' })
  description?: string;

  @ApiProperty({ description: '状态', example: 1 })
  status?: number;

  @ApiProperty({ description: '排序', example: 1 })
  sort?: number;

  @ApiProperty({ description: '菜单ID列表', example: ['1', '2', '3'] })
  menuIds?: string[];
}
