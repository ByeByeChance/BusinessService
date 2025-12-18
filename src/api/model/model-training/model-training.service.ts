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
import { TrainingRecordVo } from './vo/trainingRecord.vo';
import { QueryTrainingRecordDto } from './dto/trainingRecord.query';
import { TrainingRecordEntity } from './entities/trainingRecord.entity';
import { TrainingRecordDto } from './dto/trainingRecord.dto';
import { DebugRecordEntity } from '@src/api/image/image-debug/entities/debugRecord.entity';
import { SampleGroupEntity } from '@src/api/sample/entities/sampleGroup.entity';

@Injectable()
export class ModelTrainingService {
  constructor(
    @InjectRepository(TrainingRecordEntity)
    private readonly trainingRecordRepository: Repository<TrainingRecordEntity>,
    @InjectRepository(DebugRecordEntity)
    private readonly debugRecordRepository: Repository<DebugRecordEntity>,
    @InjectRepository(SampleGroupEntity)
    private readonly sampleGroupRepository: Repository<SampleGroupEntity>
  ) {}

  /**
   * @Description: 获取模型训练记录列表
   * @param {QueryTrainingRecordDto} queryOption
   * @return {*}
   */
  async getTrainingRecordList(
    queryOption: QueryTrainingRecordDto
  ): Promise<ResultListVo<TrainingRecordVo>> {
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

    const total = await this.trainingRecordRepository
      .createQueryBuilder('trainingRecord')
      .where([query])
      .getCount();

    const queryBuilder = this.queryTrainingRecordBuilder();
    const data: TrainingRecordVo[] = await queryBuilder
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
   * @Description: 添加模型训练记录
   * @param {TrainingRecordDto} req
   * @return {*}
   */
  async addTrainingRecord(req: TrainingRecordDto): Promise<string> {
    try {
      // 检查样本组是否存在
      const sampleGroups = await this.sampleGroupRepository.findBy({
        id: In(req.sampleGroupIds.split(',')),
        tag: 'training',
        deletedTime: undefined,
      });
      if (sampleGroups.length !== req.sampleGroupIds.split(',').length) {
        throw new HttpException(`样本组 ${req.sampleGroupIds} 不存在`, HttpStatus.BAD_REQUEST);
      }

      // 检查调试记录是否存在
      const debugRecord = await this.debugRecordRepository.findOne({
        where: {
          id: req.debugRecordId,
          status: 1,
          type: 'training',
          deletedTime: undefined,
        },
      });
      if (!debugRecord) {
        throw new HttpException(`调试记录 ${req.debugRecordId} 不存在`, HttpStatus.BAD_REQUEST);
      }

      const trainingRecordEntity = new TrainingRecordEntity();
      trainingRecordEntity.name = req.name;
      trainingRecordEntity.status = req.status || 0;
      trainingRecordEntity.sampleGroupIds = req.sampleGroupIds;
      trainingRecordEntity.sampleGroupNames = sampleGroups.map((item) => item.name).join(',');
      trainingRecordEntity.imageId = debugRecord.imageId;
      trainingRecordEntity.imageName = debugRecord.imageName;
      trainingRecordEntity.algorithmId = debugRecord.algorithmId;
      trainingRecordEntity.algorithmName = debugRecord.algorithmName;
      trainingRecordEntity.debugRecordId = req.debugRecordId;
      trainingRecordEntity.startTime = req.startTime ? +new Date(req.startTime) : undefined;
      trainingRecordEntity.endTime = req.endTime ? +new Date(req.endTime) : undefined;
      trainingRecordEntity.duration = req.duration || undefined;
      trainingRecordEntity.metrics = req.metrics || undefined;
      trainingRecordEntity.description = req.description || undefined;

      const result = await this.trainingRecordRepository.save(trainingRecordEntity);
      return String(result.id);
    } catch (error) {
      throw new HttpException(
        `模型训练记录添加失败: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * @Description: 获取训练记录查询构建器
   * @return {*}
   */
  private queryTrainingRecordBuilder(): SelectQueryBuilder<TrainingRecordEntity> {
    return this.trainingRecordRepository
      .createQueryBuilder('trainingRecord')
      .select([
        'trainingRecord.id',
        'trainingRecord.name',
        'trainingRecord.status',
        'trainingRecord.sampleGroupIds',
        'trainingRecord.sampleGroupNames',
        'trainingRecord.debugRecordId',
        'trainingRecord.imageId',
        'trainingRecord.imageName',
        'trainingRecord.algorithmId',
        'trainingRecord.algorithmName',
        'trainingRecord.description',
        'trainingRecord.resultMessage',
        'trainingRecord.startTime',
        'trainingRecord.endTime',
        'trainingRecord.duration',
        'trainingRecord.metrics',
        'trainingRecord.createdTime',
        'trainingRecord.updatedTime',
      ])
      .orderBy('trainingRecord.createdTime', 'DESC');
  }
}
