import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { QueryAlgorithmDto } from './dto/algorithm.query';
import { AlgorithmService } from './algorithm.service';
import { AlgorithmDto } from './dto/algorithm.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResultListVo } from '@src/shared/vo/result.vo';
import { AlgorithmItem } from './vo/algorithm.vo';
import { AuthGuard } from '@src/guard/auth.guard';
import { PermissionGuard } from '@src/guard/permission.guard';
import { RequireRoles } from '@src/decorators/permission.decorator';

@ApiTags('算法模块')
@Controller('/algorithmController')
@UseGuards(AuthGuard, PermissionGuard)
export class AlgorithmController {
  constructor(private readonly algorithmService: AlgorithmService) {}

  @ApiOperation({ summary: '获取算法列表' })
  @Get('getAlgorithmList')
  async getAlgorithmListApi(
    @Query() queryOption: QueryAlgorithmDto
  ): Promise<ResultListVo<AlgorithmItem>> {
    return await this.algorithmService.getAlgorithmList(queryOption);
  }

  @ApiOperation({ summary: '添加算法' })
  @Post('addAlgorithm')
  async addAlgorithmApi(@Body() req: AlgorithmDto): Promise<string> {
    return await this.algorithmService.addAlgorithm(req);
  }

  @ApiOperation({ summary: '根据算法id删除算法' })
  @RequireRoles('admin')
  @Post('deleteAlgorithmById/:id')
  async deleteAlgorithmByIdApi(@Body() req: { id: string }): Promise<string> {
    return await this.algorithmService.deleteAlgorithmById(req.id);
  }
}
