import { ApiProperty } from '@nestjs/swagger';
import { MenuEntity } from '@src/api/menu/entities/menu.entity';

export class RoleVo {
  @ApiProperty({ description: '角色ID' })
  id!: string;

  @ApiProperty({ description: '角色名称' })
  name!: string;

  @ApiProperty({ description: '角色描述' })
  description?: string;

  @ApiProperty({ description: '状态' })
  status!: number;

  @ApiProperty({ description: '排序' })
  sort!: number;

  @ApiProperty({ description: '创建时间' })
  createdTime!: Date;

  @ApiProperty({ description: '更新时间' })
  updatedTime?: Date;

  @ApiProperty({ description: '菜单列表', type: [MenuEntity] })
  menus?: MenuEntity[];

  @ApiProperty({ description: '菜单ID列表' })
  menuIds?: string[];
}
