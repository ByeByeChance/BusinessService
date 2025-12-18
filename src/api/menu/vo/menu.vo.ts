import { ApiProperty } from '@nestjs/swagger';

export class MenuItemVo {
  @ApiProperty({ description: '菜单ID' })
  id!: string;
  @ApiProperty({ description: '父菜单ID' })
  parentId?: string;
  @ApiProperty({ description: '菜单名称' })
  name?: string;
  @ApiProperty({ description: '菜单路径' })
  path?: string;
  @ApiProperty({ description: '组件路径' })
  component?: string;
  @ApiProperty({ description: '组件名称' })
  componentName?: string;
  @ApiProperty({ description: '重定向路径' })
  redirect?: string;
  @ApiProperty({ description: '菜单元数据' })
  meta!: MenuMetaVo;
  @ApiProperty({ description: '子菜单列表' })
  children?: MenuItemVo[];
}

export class MenuMetaVo {
  @ApiProperty({ description: '图标' })
  icon?: string;
  @ApiProperty({ description: '标题' })
  title?: string;
  @ApiProperty({ description: '是否为链接' })
  isLink?: string;
  @ApiProperty({ description: '是否隐藏' })
  isHide?: boolean;
  @ApiProperty({ description: '是否全屏' })
  isFull?: boolean;
  @ApiProperty({ description: '是否固定' })
  isAffix?: boolean;
  @ApiProperty({ description: '是否缓存' })
  isKeepAlive?: boolean;
  @ApiProperty({ description: '权限标识' })
  permission?: string;
  @ApiProperty({ description: '菜单类型' })
  type?: string;
  @ApiProperty({ description: '排序' })
  sort?: number;
}
