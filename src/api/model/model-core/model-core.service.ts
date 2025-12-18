import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  FindOperator,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PageEnum } from '@src/enums/page.enum';
import { ResultListVo } from '@src/shared/vo/result.vo';
import { ModelVo } from './vo/model.vo';
import { QueryModelDto } from './dto/model.query';
import { ModelEntity } from './entities/model.entity';
import { ModelDto } from './dto/model.dto';

@Injectable()
export class ModelCoreService {
  constructor(
    @InjectRepository(ModelEntity)
    private readonly modelRepository: Repository<ModelEntity>
  ) {}

  /**
   * @Description: 获取模型列表
   * @param {QueryModelDto} queryOption
   * @return {*}
   */
  async getModelList(queryOption: QueryModelDto): Promise<ResultListVo<ModelVo>> {
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

    const total = await this.modelRepository.createQueryBuilder('model').where([query]).getCount();

    const queryBuilder = this.queryModelBuilder();
    const data: ModelVo[] = await queryBuilder
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
   * @Description: 添加模型
   * @param {ModelDto} req
   * @return {*}
   */
  async addModel(req: ModelDto): Promise<string> {
    try {
      const modelEntity = new ModelEntity();
      modelEntity.name = req.name;
      modelEntity.size = req.size;
      modelEntity.path = req.path;
      modelEntity.description = req.description || '';
      modelEntity.status = req.status || 0;
      modelEntity.score = req.score || 0;
      modelEntity.minScore = req.minScore || 0;
      modelEntity.maxScore = req.maxScore || 0;
      modelEntity.debugRecordId = req.debugRecordId;

      const result = await this.modelRepository.save(modelEntity);
      return String(result.id);
    } catch (error) {
      throw new HttpException(
        `模型添加失败: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * @Description: 根据模型id删除模型
   * @param {string} id
   * @return {*}
   */
  async deleteModelById(id: string): Promise<string> {
    try {
      const result = await this.modelRepository.delete(id);
      if (result.affected === 0) {
        throw new HttpException('模型不存在', HttpStatus.NOT_FOUND);
      }
      return id;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `模型删除失败: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * @Description: 获取模型查询构建器
   * @return {*}
   */
  private queryModelBuilder(): SelectQueryBuilder<ModelEntity> {
    return this.modelRepository
      .createQueryBuilder('model')
      .select([
        'model.id',
        'model.name',
        'model.size',
        'model.path',
        'model.status',
        'model.score',
        'model.minScore',
        'model.maxScore',
        'model.description',
        'model.debugRecordId',
        'model.createdTime',
        'model.updatedTime',
      ])
      .orderBy('model.createdTime', 'DESC');
  }
}
