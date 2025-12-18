import { Injectable } from '@nestjs/common';
import { ModelCoreService } from './model-core/model-core.service';
import { ModelTrainingService } from './model-training/model-training.service';
import { ModelEvalService } from './model-eval/model-eval.service';
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

@Injectable()
export class ModelService {
  constructor(
    private readonly modelCoreService: ModelCoreService,
    private readonly modelTrainingService: ModelTrainingService,
    private readonly modelEvalService: ModelEvalService
  ) {}

  /**
   * @Description: 获取模型列表
   * @param {QueryModelDto} queryOption
   * @return {*}
   */
  async getModelList(queryOption: QueryModelDto): Promise<ResultListVo<ModelVo>> {
    return this.modelCoreService.getModelList(queryOption);
  }

  /**
   * @Description: 添加模型
   * @param {ModelDto} req
   * @return {*}
   */
  async addModel(req: ModelDto): Promise<string> {
    return this.modelCoreService.addModel(req);
  }

  /**
   * @Description: 根据模型id删除模型
   * @param {string} id
   * @return {*}
   */
  async deleteModelById(id: string): Promise<string> {
    return this.modelCoreService.deleteModelById(id);
  }

  /**
   * @Description: 获取模型训练记录列表
   * @param {QueryTrainingRecordDto} queryOption
   * @return {*}
   */
  async getTrainingRecordList(
    queryOption: QueryTrainingRecordDto
  ): Promise<ResultListVo<TrainingRecordVo>> {
    return this.modelTrainingService.getTrainingRecordList(queryOption);
  }

  /**
   * @Description: 添加模型训练记录
   * @param {TrainingRecordDto} req
   * @return {*}
   */
  async addTrainingRecord(req: TrainingRecordDto): Promise<string> {
    return this.modelTrainingService.addTrainingRecord(req);
  }

  /**
   * @Description: 获取模型测评记录列表
   * @param {QueryEvalRecordDto} queryOption
   * @return {*}
   */
  async getEvalRecordList(queryOption: QueryEvalRecordDto): Promise<ResultListVo<EvalRecordVo>> {
    return this.modelEvalService.getEvalRecordList(queryOption);
  }

  /**
   * @Description: 添加模型测评记录
   * @param {EvalRecordDto} req
   * @return {*}
   */
  async addEvalRecord(req: EvalRecordDto): Promise<string> {
    return this.modelEvalService.addEvalRecord(req);
  }
}
