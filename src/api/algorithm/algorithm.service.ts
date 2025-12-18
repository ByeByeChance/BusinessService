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
import { AlgorithmItem } from './vo/algorithm.vo';
import { QueryAlgorithmDto } from './dto/algorithm.query';
import { AlgorithmEntity } from './entities/algorithm.entity';
import { AlgorithmDto } from './dto/algorithm.dto';
import { ResourceEntity } from '../resource/entities/resource.entity';

@Injectable()
export class AlgorithmService {
  constructor(
    @InjectRepository(AlgorithmEntity)
    private readonly algorithmRepository: Repository<AlgorithmEntity>
  ) {}

  /**
   * @Description: 获取算法列表
   * @param {QueryAlgorithmDto} queryOption
   * @return {*}
   */
  async getAlgorithmList(queryOption: QueryAlgorithmDto): Promise<ResultListVo<AlgorithmItem>> {
    const {
      id,
      name,
      userId,
      current = PageEnum.PAGE_NUMBER,
      pageSize = PageEnum.PAGE_SIZE,
      createdTimeStart,
      createdTimeEnd,
      updatedTimeStart,
      updatedTimeEnd,
    } = queryOption;
    const query: Record<string, FindOperator<string> | string | number> = {
      ...(id && { id }),
      ...(name && { name: ILike(`%${name}%`) }),
      ...(userId && { userId }),
      ...(createdTimeStart && { createdTime: MoreThanOrEqual(createdTimeStart) }),
      ...(createdTimeEnd && { createdTime: LessThanOrEqual(createdTimeEnd) }),
      ...(updatedTimeStart && { updatedTime: MoreThanOrEqual(updatedTimeStart) }),
      ...(updatedTimeEnd && { updatedTime: LessThanOrEqual(updatedTimeEnd) }),
    };

    const total = await this.algorithmRepository
      .createQueryBuilder('algorithm')
      .where([query])
      .getCount();

    const queryBuilder = this.queryAlgorithmBuilder();
    const data: AlgorithmItem[] = await queryBuilder
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
  }

  /**
   * @Description: 添加算法
   * @param {AlgorithmDto} req
   * @return {*}
   */
  async addAlgorithm(req: AlgorithmDto): Promise<string> {
    try {
      const algorithmEntity = new AlgorithmEntity();
      algorithmEntity.name = req.name;
      algorithmEntity.version = req.version;
      algorithmEntity.resourceId = req.resourceId;
      algorithmEntity.description = req.description;
      algorithmEntity.userId = req.userId;

      const result = await this.algorithmRepository.save(algorithmEntity);
      return String(result.id);
    } catch (error) {
      throw new HttpException(
        `算法添加失败: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * @Description: 根据算法id删除算法
   * @param {string} id
   * @return {*}
   */
  async deleteAlgorithmById(id: string): Promise<string> {
    try {
      const result = await this.algorithmRepository.delete(id);
      if (result.affected === 0) {
        throw new HttpException('算法不存在', HttpStatus.NOT_FOUND);
      }
      return id;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `算法删除失败: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * @Description: 获取算法查询构建器
   * @return {*}
   */
  private queryAlgorithmBuilder(): SelectQueryBuilder<AlgorithmEntity> {
    const queryBuilder = this.algorithmRepository
      .createQueryBuilder('algorithm')
      .leftJoin(ResourceEntity, 'resource', 'algorithm.resourceId = resource.id');

    return queryBuilder
      .select([
        'algorithm.id',
        'algorithm.name',
        'algorithm.version',
        'algorithm.resourceId',
        'resource.path as resourcePath',
        'algorithm.description',
        'algorithm.userId',
        'algorithm.createdTime as createdTime',
        'algorithm.updatedTime as updatedTime',
      ])
      .orderBy('algorithm.createdTime', 'DESC');
  }
}
