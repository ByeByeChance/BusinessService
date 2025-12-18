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
import { SampleGroupEntity } from './entities/sampleGroup.entity';
import { SampleEntity } from './entities/sample.entity';
import { QuerySampleGroupDto } from './dto/sampleGroup.query';
import { QuerySampleDto } from './dto/sample.query';
import { SampleGroupDto } from './dto/sampleGroup.dto';
import { SampleGroupItemVo } from './vo/sampleGroup.vo';
import { SampleItemVo } from './vo/sample.vo';
import { UserEntity } from '../user/entities/user.entity';
import { ResourceEntity } from '../resource/entities/resource.entity';
import { ICurrentUserType } from '@src/decorators';

@Injectable()
export class SampleService {
  constructor(
    @InjectRepository(SampleGroupEntity)
    private readonly sampleGroupRepository: Repository<SampleGroupEntity>,
    @InjectRepository(SampleEntity)
    private readonly sampleRepository: Repository<SampleEntity>,
    @InjectRepository(ResourceEntity)
    private readonly resourceRepository: Repository<ResourceEntity>
  ) {}

  /**
   * @Description: 获取样本分组列表
   * @param {QuerySampleGroupDto} queryOption
   * @return {*}
   */
  async getSampleGroupList(
    queryOption: QuerySampleGroupDto
  ): Promise<ResultListVo<SampleGroupItemVo>> {
    const {
      id,
      name,
      userId,
      tag,
      createdTimeStart,
      createdTimeEnd,
      updatedTimeStart,
      updatedTimeEnd,
      current = PageEnum.PAGE_NUMBER,
      pageSize = PageEnum.PAGE_SIZE,
    } = queryOption;

    const query: Record<string, FindOperator<string> | string | Date | number> = {
      ...(id && { id }),
      ...(name && { name: ILike(`%${name}%`) }),
      ...(userId && { userId }),
      ...(tag && { tag }),
      ...(createdTimeStart && { createdTime: MoreThanOrEqual(createdTimeStart) }),
      ...(createdTimeEnd && { createdTime: LessThanOrEqual(createdTimeEnd) }),
      ...(updatedTimeStart && { updatedTime: MoreThanOrEqual(updatedTimeStart) }),
      ...(updatedTimeEnd && { updatedTime: LessThanOrEqual(updatedTimeEnd) }),
    };

    const total = await this.sampleGroupRepository
      .createQueryBuilder('sampleGroup')
      .where([query])
      .getCount();

    const queryBuilder = this.querySampleGroupBuilder();
    const data = await queryBuilder
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
   * @Description: 添加样本分组
   * @param {SampleGroupDto} req
   * @return {*}
   */
  async addSampleGroup(req: SampleGroupDto, user: ICurrentUserType): Promise<string> {
    // 检查是否已存在同名样本组
    const existingSampleGroup = await this.sampleGroupRepository.findOne({
      where: {
        name: req.name,
      },
      select: ['id'],
    });
    if (existingSampleGroup?.id) {
      throw new HttpException('同名样本组已存在', HttpStatus.BAD_REQUEST);
    }

    // 检查资源是否存在
    const existingResource = await this.resourceRepository.findOne({
      where: {
        id: req.resourceId,
      },
      select: ['id'],
    });
    if (!existingResource?.id) {
      throw new HttpException('资源不存在', HttpStatus.BAD_REQUEST);
    }

    // 创建数据
    const data = this.sampleGroupRepository.create({
      name: req.name,
      tag: req.tag,
      userId: user.id,
      description: req.description,
      resourceId: req.resourceId,
      sampleCount: 0,
    });

    await this.sampleGroupRepository.save(data);
    return '创建成功';
  }

  /**
   * @Description: 获取样本列表
   * @param {QuerySampleDto} queryOption
   * @return {*}
   */
  async getSampleList(queryOption: QuerySampleDto): Promise<ResultListVo<SampleItemVo>> {
    const {
      id,
      groupId,
      name,
      createdTimeStart,
      createdTimeEnd,
      updatedTimeStart,
      updatedTimeEnd,
      current = PageEnum.PAGE_NUMBER,
      pageSize = PageEnum.PAGE_SIZE,
    } = queryOption;

    const query: Record<string, FindOperator<string> | string | Date | number> = {
      ...(id && { id }),
      ...(groupId && { groupId }),
      ...(name && { name: ILike(`%${name}%`) }),
      ...(createdTimeStart && { createdTime: MoreThanOrEqual(createdTimeStart) }),
      ...(createdTimeEnd && { createdTime: LessThanOrEqual(createdTimeEnd) }),
      ...(updatedTimeStart && { updatedTime: MoreThanOrEqual(updatedTimeStart) }),
      ...(updatedTimeEnd && { updatedTime: LessThanOrEqual(updatedTimeEnd) }),
    };

    const total = await this.sampleRepository
      .createQueryBuilder('sample')
      .where([query])
      .getCount();

    const queryBuilder = this.querySampleBuilder();
    const data = await queryBuilder
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
   * @Description: 删除样本分组
   * @param {string} id
   * @return {*}
   */
  async deleteSampleGroup(id: string): Promise<string> {
    const group = await this.sampleGroupRepository.findOne({
      where: { id: id },
    });

    if (!group?.id) {
      throw new HttpException('数据集不存在', HttpStatus.BAD_REQUEST);
    }

    // 检查是否有样本关联到此分组
    const sampleCount = await this.sampleRepository.count({
      where: { groupId: id },
    });

    if (sampleCount > 0) {
      throw new HttpException('数据集下有样本，无法删除', HttpStatus.BAD_REQUEST);
    }

    const { affected } = await this.sampleGroupRepository.softDelete(id);
    if (affected) {
      return '删除成功';
    } else {
      return '删除失败';
    }
  }

  /**
   * @Description: 删除样本
   * @param {string} id
   * @return {*}
   */
  async deleteSample(id: string): Promise<string> {
    const sample = await this.sampleRepository.findOne({
      where: { id: id },
    });

    if (!sample?.id) {
      throw new HttpException('样本不存在', HttpStatus.BAD_REQUEST);
    }

    const { affected } = await this.sampleRepository.softDelete(id);

    // 如果删除成功，更新对应分组的样本数量
    if (affected && sample.groupId) {
      const group = await this.sampleGroupRepository.findOne({
        where: { id: sample.groupId },
      });

      if (group) {
        group.sampleCount = Math.max(0, group.sampleCount - 1);
        await this.sampleGroupRepository.save(group);
      }
    }

    return affected ? '删除成功' : '删除失败';
  }

  // 内部查询方法 - 样本分组
  private querySampleGroupBuilder(): SelectQueryBuilder<SampleGroupEntity> {
    const queryBuilder = this.sampleGroupRepository
      .createQueryBuilder('sampleGroup')
      .leftJoin(UserEntity, 'user', 'sampleGroup.userId = user.id')
      .leftJoin(ResourceEntity, 'resource', 'sampleGroup.resourceId = resource.id');

    // 使用数组方式选择字段，避免类型推断问题
    queryBuilder.select([
      'sampleGroup.id',
      'sampleGroup.name',
      'sampleGroup.tag',
      'sampleGroup.sampleCount',
      'sampleGroup.resourceId',
      'resource.path as resourcePath',
      'sampleGroup.description',
      'sampleGroup.userId',
      'sampleGroup.createdTime',
      'sampleGroup.updatedTime',
      'sampleGroup.deletedTime',
      'user.username',
    ]);

    return queryBuilder.orderBy('sampleGroup.createdTime', 'DESC');
  }

  // 内部查询方法 - 样本
  private querySampleBuilder(): SelectQueryBuilder<SampleEntity> {
    const queryBuilder = this.sampleRepository.createQueryBuilder('sample');

    queryBuilder.select([
      'sample.id',
      'sample.groupId',
      'sample.name',
      'sample.path',
      'sample.size',
      'sample.description',
      'sample.createdTime',
      'sample.updatedTime',
    ]);

    return queryBuilder.orderBy('sample.createdTime', 'DESC');
  }
}
