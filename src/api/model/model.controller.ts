import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ModelService } from './model.service';
import { ResultListVo } from '@src/shared/vo/result.vo';
import { ModelVo } from './model-core/vo/model.vo';
import { QueryModelDto } from './model-core/dto/model.query';
import { ModelDto } from './model-core/dto/model.dto';
import { TrainingRecordVo } from './model-training/vo/trainingRecord.vo';
import { QueryTrainingRecordDto } from './model-training/dto/trainingRecord.query';
import { TrainingRecordDto } from './model-training/dto/trainingRecord.dto';
import { EvalRecordVo } from './model-eval/vo/evalRecord.vo';
import { QueryEvalRecordDto } from './model-eval/dto/evalRecord.query';
import { EvalRecordDto } from './model-eval/dto/evalRecord.dto';
import { AuthGuard } from '@src/guard/auth.guard';
import { PermissionGuard } from '@src/guard/permission.guard';
import { RequireRoles } from '@src/decorators/permission.decorator';

@ApiTags('模型管理')
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@Controller('modelController')
export class ModelController {
  constructor(private readonly modelService: ModelService) {}

  @ApiOperation({ summary: '获取模型列表' })
  @Get('getModelList')
  async getModelList(@Query() queryOption: QueryModelDto): Promise<ResultListVo<ModelVo>> {
    return this.modelService.getModelList(queryOption);
  }

  @ApiOperation({ summary: '添加模型' })
  @Post('addModel')
  async addModel(@Body() req: ModelDto): Promise<string> {
    return this.modelService.addModel(req);
  }

  @ApiOperation({ summary: '根据模型id删除模型' })
  @RequireRoles('admin')
  @Post('deleteModelById')
  async deleteModelById(@Body() req: { id: string }): Promise<string> {
    return this.modelService.deleteModelById(req.id);
  }

  @ApiOperation({ summary: '获取模型训练记录列表' })
  @Get('training/getTrainingRecordList')
  async getTrainingRecordList(
    @Query() queryOption: QueryTrainingRecordDto
  ): Promise<ResultListVo<TrainingRecordVo>> {
    return this.modelService.getTrainingRecordList(queryOption);
  }

  @ApiOperation({ summary: '添加模型训练记录' })
  @Post('training/addTrainingRecord')
  async addTrainingRecord(@Body() req: TrainingRecordDto): Promise<string> {
    return this.modelService.addTrainingRecord(req);
  }

  @ApiOperation({ summary: '获取模型测评记录列表' })
  @Get('eval/getEvalRecordList')
  async getEvalRecordList(
    @Query() queryOption: QueryEvalRecordDto
  ): Promise<ResultListVo<EvalRecordVo>> {
    return this.modelService.getEvalRecordList(queryOption);
  }

  @ApiOperation({ summary: '添加模型测评记录' })
  @Post('eval/addEvalRecord')
  async addEvalRecord(@Body() req: EvalRecordDto): Promise<string> {
    return this.modelService.addEvalRecord(req);
  }
}
