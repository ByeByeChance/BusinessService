import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  FindOperator,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PageEnum } from '@src/enums/page.enum';
import { ResultListVo } from '@src/shared/vo/result.vo';
import { EvalRecordVo } from './vo/evalRecord.vo';
import { QueryEvalRecordDto } from './dto/evalRecord.query';
import { EvalRecordEntity } from './entities/evalRecord.entity';
import { EvalRecordDto } from './dto/evalRecord.dto';
import { DebugRecordEntity } from '@src/api/image/image-debug/entities/debugRecord.entity';
import { SampleGroupEntity } from '@src/api/sample/entities/sampleGroup.entity';

@Injectable()
export class ModelEvalService {
  constructor(
    @InjectRepository(EvalRecordEntity)
    private readonly evalRecordRepository: Repository<EvalRecordEntity>,
    @InjectRepository(DebugRecordEntity)
    private readonly debugRecordRepository: Repository<DebugRecordEntity>,
    @InjectRepository(SampleGroupEntity)
    private readonly sampleGroupRepository: Repository<SampleGroupEntity>
  ) {}

  /**
   * @Description: 获取模型测评记录列表
   * @param {QueryEvalRecordDto} queryOption
   * @return {*}
   */
  async getEvalRecordList(queryOption: QueryEvalRecordDto): Promise<ResultListVo<EvalRecordVo>> {
    const {
      id,
      name,
      status,
      current = PageEnum.PAGE_NUMBER,
      pageSize = PageEnum.PAGE_SIZE,
      createdTimeStart,
      createdTimeEnd,
      updatedTimeStart,
      updatedTimeEnd,
    } = queryOption;
    const query: Record<string, FindOperator<string> | string | number | Date> = {
      ...(id && { id }),
      ...(name && { name: ILike(`%${name}%`) }),
      ...(status && { status }),
      ...(createdTimeStart && { createdTime: MoreThanOrEqual(createdTimeStart) }),
      ...(createdTimeEnd && { createdTime: LessThanOrEqual(createdTimeEnd) }),
      ...(updatedTimeStart && { updatedTime: MoreThanOrEqual(updatedTimeStart) }),
      ...(updatedTimeEnd && { updatedTime: LessThanOrEqual(updatedTimeEnd) }),
    };

    const total = await this.evalRecordRepository
      .createQueryBuilder('evalRecord')
      .where([query])
      .getCount();

    const queryBuilder = this.queryEvalRecordBuilder();
    const data: EvalRecordVo[] = await queryBuilder
      .where([query])
      .offset((current - 1) * pageSize)
      .limit(pageSize)
      .getMany();

    return {
      list: data || [],
      total,
      current,
      pageSize,
    };
  }

  /**
   * @Description: 添加模型测评记录
   * @param {EvalRecordDto} req
   * @return {*}
   */
  async addEvalRecord(req: EvalRecordDto): Promise<string> {
    try {
      // 检查调试记录是否存在
      const debugRecord = await this.debugRecordRepository.findOne({
        where: {
          id: req.debugRecordId,
          status: 1,
          type: 'evaluation',
          deletedTime: undefined,
        },
      });
      if (!debugRecord) {
        throw new HttpException(`调试记录 ${req.debugRecordId} 不存在`, HttpStatus.BAD_REQUEST);
      }

      // 检查样本组是否存在
      const sampleGroups = await this.sampleGroupRepository.findBy({
        id: In(req.sampleGroupIds.split(',')),
        tag: 'evaluation',
        deletedTime: undefined,
      });
      if (sampleGroups.length !== req.sampleGroupIds.split(',').length) {
        throw new HttpException(`样本组 ${req.sampleGroupIds} 不存在`, HttpStatus.BAD_REQUEST);
      }

      const evalRecordEntity = new EvalRecordEntity();
      evalRecordEntity.name = req.name;
      evalRecordEntity.status = req.status || 0;
      evalRecordEntity.score = req.score || 0;
      evalRecordEntity.sampleGroupIds = req.sampleGroupIds;
      evalRecordEntity.sampleGroupNames = sampleGroups.map((item) => item.name).join(',');
      evalRecordEntity.debugRecordId = req.debugRecordId;
      evalRecordEntity.imageId = debugRecord.imageId;
      evalRecordEntity.imageName = debugRecord.imageName;
      evalRecordEntity.algorithmId = debugRecord.algorithmId;
      evalRecordEntity.algorithmName = debugRecord.algorithmName;
      evalRecordEntity.modelId = debugRecord.modelId || '';
      evalRecordEntity.modelName = debugRecord.modelName || '';
      evalRecordEntity.description = req.description || '';
      evalRecordEntity.startTime = req.startTime ? +new Date(req.startTime) : undefined;
      evalRecordEntity.endTime = req.endTime ? +new Date(req.endTime) : undefined;
      evalRecordEntity.duration = req.duration || 0;
      evalRecordEntity.metrics = req.metrics;

      const result = await this.evalRecordRepository.save(evalRecordEntity);
      return String(result.id);
    } catch (error) {
      throw new HttpException(
        `模型测评记录添加失败: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * @Description: 获取测评记录查询构建器
   * @return {*}
   */
  private queryEvalRecordBuilder(): SelectQueryBuilder<EvalRecordEntity> {
    return this.evalRecordRepository
      .createQueryBuilder('evalRecord')
      .select([
        'evalRecord.id',
        'evalRecord.name',
        'evalRecord.status',
        'evalRecord.score',
        'evalRecord.sampleGroupIds',
        'evalRecord.sampleGroupNames',
        'evalRecord.imageId',
        'evalRecord.imageName',
        'evalRecord.algorithmId',
        'evalRecord.algorithmName',
        'evalRecord.modelId',
        'evalRecord.modelName',
        'evalRecord.description',
        'evalRecord.debugRecordId',
        'evalRecord.startTime',
        'evalRecord.endTime',
        'evalRecord.duration',
        'evalRecord.metrics',
        'evalRecord.createdTime',
        'evalRecord.updatedTime',
      ])
      .orderBy('evalRecord.createdTime', 'DESC');
  }
}
