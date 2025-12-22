import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class MenuDto {
  @ApiProperty({ description: 'id', default: '' })
  id!: string;

  @ApiProperty({ description: '父级id', default: '' })
  parentId?: string;

  @ApiProperty({ description: '菜单路径', default: '/home' })
  path!: string;

  @ApiProperty({ description: '菜单name', required: true, default: 'home' })
  @IsNotEmpty({ message: '菜单name不能为空' })
  name!: string;

  @ApiProperty({ description: '组件路径', default: '/home/index' })
  component!: string;

  @ApiProperty({ description: '组件名称', default: 'Home' })
  componentName?: string;

  @ApiProperty({ description: '重定向菜单路径', default: '/home' })
  redirect!: string;

  @ApiProperty({ description: '菜单图标', default: 'home' })
  icon!: string;

  @ApiProperty({ description: '菜单名称', default: '首页' })
  title!: string;

  @ApiProperty({ description: '是否外链', default: '' })
  isLink!: string;

  @ApiProperty({ description: '是否隐藏', default: 0 })
  isHide!: number;

  @ApiProperty({ description: '是否全屏', default: 0 })
  isFull!: number;

  @ApiProperty({ description: '是否在标签栏固定', default: 0 })
  isAffix!: number;

  @ApiProperty({ description: '是否缓存页面', default: 0 })
  isKeepAlive!: number;

  @ApiProperty({ description: '权限标识', default: '' })
  permission?: string;

  @ApiProperty({ description: '菜单类型', default: 'menu', enum: ['menu', 'button', 'api'] })
  type?: string;

  @ApiProperty({ description: '排序', default: 0 })
  sort!: number;
}
