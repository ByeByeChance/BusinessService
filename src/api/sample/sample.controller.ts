import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResultListVo } from '@src/shared/vo/result.vo';
import { SampleService } from './sample.service';
import { QuerySampleGroupDto } from './dto/sampleGroup.query';
import { QuerySampleDto } from './dto/sample.query';
import { SampleGroupDto } from './dto/sampleGroup.dto';
import { SampleGroupItemVo } from './vo/sampleGroup.vo';
import { SampleItemVo } from './vo/sample.vo';
import { CurrentUser, ICurrentUserType } from '@src/decorators';
import { PermissionGuard } from '@src/guard/permission.guard';
import { RequireRoles } from '@src/decorators/permission.decorator';
import { AuthGuard } from '@src/guard/auth.guard';

@ApiTags('样本管理')
@UseGuards(AuthGuard, PermissionGuard)
@ApiBearerAuth()
@Controller('sampleController')
export class SampleController {
  constructor(private readonly sampleService: SampleService) {}

  @ApiOperation({ summary: '获取样本分组列表' })
  @Get('getSampleGroupList')
  async getSampleGroupList(
    @Query() queryOption: QuerySampleGroupDto
    // @CurrentUser() user: ICurrentUserType
  ): Promise<ResultListVo<SampleGroupItemVo>> {
    return this.sampleService.getSampleGroupList(queryOption);
  }

  @ApiOperation({ summary: '添加样本分组' })
  @Post('addSampleGroup')
  async addSampleGroup(
    @Body() req: SampleGroupDto,
    @CurrentUser() user: ICurrentUserType
  ): Promise<string> {
    return this.sampleService.addSampleGroup(req, user);
  }

  @ApiOperation({ summary: '删除样本分组' })
  @RequireRoles('admin')
  @Delete('deleteSampleGroup/:id')
  async deleteSampleGroup(@Param('id') id: string): Promise<string> {
    return this.sampleService.deleteSampleGroup(id);
  }

  @ApiOperation({ summary: '获取样本列表' })
  @Get('getSampleList')
  async getSampleList(@Query() queryOption: QuerySampleDto): Promise<ResultListVo<SampleItemVo>> {
    return this.sampleService.getSampleList(queryOption);
  }

  @ApiOperation({ summary: '删除样本' })
  @RequireRoles('admin')
  @Delete('deleteSample/:id')
  async deleteSample(@Param('id') id: string): Promise<string> {
    return this.sampleService.deleteSample(id);
  }
}
