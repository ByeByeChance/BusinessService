import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DebugRecordEntity } from './entities/debugRecord.entity';
import {
  FindOperator,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { QueryDebugRecordDto } from './dto/debugRecord.query';
import { DebugRecordVo } from './vo/debugRecord.vo';
import { ResultListVo } from '@src/shared/vo/result.vo';
import { PageEnum } from '@src/enums/page.enum';
import { ICurrentUserType } from '@src/decorators';
import { UserEntity } from '../../user/entities/user.entity';
import { SampleGroupEntity } from '../../sample/entities/sampleGroup.entity';
import { AlgorithmEntity } from '../../algorithm/entities/algorithm.entity';
import { ModelEntity } from '../../model/model-core/entities/model.entity';
import { DebugRecordDto } from './dto/debugRecord.dto';
import { ImageEntity } from '../image-core/entities/image.entity';

@Injectable()
export class ImageDebugService {
  constructor(
    @InjectRepository(DebugRecordEntity)
    private readonly debugRecordRepository: Repository<DebugRecordEntity>,
    @InjectRepository(SampleGroupEntity)
    private readonly sampleGroupRepository: Repository<SampleGroupEntity>,
    @InjectRepository(AlgorithmEntity)
    private readonly algorithmRepository: Repository<AlgorithmEntity>,
    @InjectRepository(ModelEntity)
    private readonly modelRepository: Repository<ModelEntity>,
    @InjectRepository(ImageEntity)
    private readonly imageRepository: Repository<ImageEntity>
  ) {}

  /**
   * @Description: 获取调试记录列表
   * @param {QueryDebugRecordDto} queryOption
   * @return {*}
   */
  async getDebugRecordList(queryOption: QueryDebugRecordDto): Promise<ResultListVo<DebugRecordVo>> {
    try {
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

      const total = await this.debugRecordRepository
        .createQueryBuilder('debugRecord')
        .where([query])
        .getCount();
      const queryBuilder = this.queryDebugRecordBuilder();
      const data: DebugRecordVo[] = await queryBuilder
        .where([query])
        .offset((current - 1) * pageSize)
        .limit(pageSize)
        .getMany();

      return {
        list: data,
        total,
        current,
        pageSize,
      };
    } catch (error) {
      throw new HttpException(
        `调试记录列表获取失败: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async startDebug(debugRecordDto: DebugRecordDto, user: ICurrentUserType): Promise<string> {
    try {
      if (debugRecordDto.type === 'evaluation' && !debugRecordDto.modelId) {
        throw new HttpException(`评估调试记录需要指定模型`, HttpStatus.BAD_REQUEST);
      }
      // 检查模型是否存在
      const model = await this.modelRepository.findOne({
        where: {
          id: debugRecordDto.modelId,
          deletedTime: undefined,
        },
      });
      if (debugRecordDto.type === 'evaluation' && debugRecordDto.modelId && !model) {
        throw new HttpException(`指定的模型不存在`, HttpStatus.BAD_REQUEST);
      }

      // 检查样本组是否存在
      const sampleGroups = await this.sampleGroupRepository.findBy({
        id: In(debugRecordDto.sampleGroupIds.split(',')),
        tag: debugRecordDto.type === 'evaluation' ? 'debug_evaluation' : 'debug_training',
        deletedTime: undefined,
      });
      if (sampleGroups.length !== debugRecordDto.sampleGroupIds.split(',').length) {
        throw new HttpException(`指定的样本组不存在`, HttpStatus.BAD_REQUEST);
      }

      // 检查评测镜像是否存在
      const image = await this.imageRepository.findOne({
        where: {
          id: debugRecordDto.imageId,
          deletedTime: undefined,
        },
      });
      if (!image) {
        throw new HttpException(`指定的评测镜像不存在`, HttpStatus.BAD_REQUEST);
      }

      // 检查算法是否存在
      const algorithm = await this.algorithmRepository.findOne({
        where: {
          id: debugRecordDto.algorithmId,
          deletedTime: undefined,
        },
      });
      if (!algorithm) {
        throw new HttpException(`指定的算法不存在`, HttpStatus.BAD_REQUEST);
      }

      const data = this.debugRecordRepository.create({
        ...debugRecordDto,
        sampleGroupNames: sampleGroups.map((item) => item.name).join(','),
        modelName: model?.name || undefined,
        imageName: image.name,
        algorithmName: algorithm.name,
        status: 0,
        userId: user.id,
      });
      await this.debugRecordRepository.save(data);
      return '创建成功';
    } catch (error) {
      throw new HttpException(
        `调试记录创建失败: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 内部查询方法
  private queryDebugRecordBuilder(): SelectQueryBuilder<DebugRecordEntity> {
    const queryBuilder = this.debugRecordRepository.createQueryBuilder('debugRecord');

    // 关联user表查询用户名
    queryBuilder.leftJoin(UserEntity, 'user', 'debugRecord.userId = user.id');

    // 使用数组方式选择字段，避免类型推断问题
    queryBuilder.select([
      'debugRecord.id',
      'debugRecord.name',
      'debugRecord.status',
      'debugRecord.type',
      'debugRecord.description',
      'debugRecord.resultMessage',
      'debugRecord.imageName',
      'debugRecord.algorithmName',
      'debugRecord.sampleGroupNames',
      'debugRecord.modelName',
      'debugRecord.createdTime',
      'debugRecord.updatedTime',
      'debugRecord.deletedTime',
      'user.name as username',
    ]);

    // 按debugRecord.id分组，确保每个debug记录只返回一条
    queryBuilder.groupBy('debugRecord.id');

    return queryBuilder.orderBy('debugRecord.createdTime', 'DESC');
  }
}
