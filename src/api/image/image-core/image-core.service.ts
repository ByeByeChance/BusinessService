import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageEntity } from './entities/image.entity';
import {
  FindOperator,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { ImageDto } from './dto/image.dto';
import { QueryImageDto } from './dto/image.query';
import { ImageVo } from './vo/image.vo';
import { ResultListVo } from '@src/shared/vo/result.vo';
import { PageEnum } from '@src/enums/page.enum';
import { ICurrentUserType } from '@src/decorators';
import { UserEntity } from '../../user/entities/user.entity';
import { ResourceEntity } from '../../resource/entities/resource.entity';

@Injectable()
export class ImageCoreService {
  constructor(
    @InjectRepository(ImageEntity)
    private readonly imageRepository: Repository<ImageEntity>,
    @InjectRepository(ResourceEntity)
    private readonly resourceRepository: Repository<ResourceEntity>
  ) {}

  /**
   * @Description: 创建镜像
   * @param {ImageDto} imageDto
   * @return {*}
   */
  async createImage(imageDto: ImageDto, user: ICurrentUserType): Promise<string> {
    try {
      // 检查资源是否存在
      const existingResource = await this.resourceRepository.findOne({
        where: {
          id: imageDto.resourceId,
        },
        select: ['id'],
      });
      if (!existingResource?.id) {
        throw new HttpException('资源不存在', HttpStatus.BAD_REQUEST);
      }

      const image = this.imageRepository.create({
        ...imageDto,
        userId: user.id,
      });
      const result = await this.imageRepository.save(image);

      return result.id;
    } catch (error) {
      throw new HttpException(
        `镜像创建失败: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * @Description: 获取镜像列表
   * @param {QueryImageDto} queryOption
   * @return {*}
   */
  async getImageList(queryOption: QueryImageDto): Promise<ResultListVo<ImageVo>> {
    try {
      const {
        id,
        name,
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
        ...(createdTimeStart && { createdTime: MoreThanOrEqual(createdTimeStart) }),
        ...(createdTimeEnd && { createdTime: LessThanOrEqual(createdTimeEnd) }),
        ...(updatedTimeStart && { updatedTime: MoreThanOrEqual(updatedTimeStart) }),
        ...(updatedTimeEnd && { updatedTime: LessThanOrEqual(updatedTimeEnd) }),
      };

      const total = await this.imageRepository
        .createQueryBuilder('image')
        .where([query])
        .getCount();
      const queryBuilder = this.queryImageBuilder();
      const data: ImageVo[] = await queryBuilder
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
        `镜像列表获取失败: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * @Description: 删除镜像
   * @param {id} id
   * @return {*}
   */
  async deleteImageById(id: string): Promise<string> {
    const imageEntity: ImageEntity | null = await this.imageRepository.findOne({
      where: { id },
    });
    if (!imageEntity?.id) {
      throw new HttpException(`镜像不存在`, HttpStatus.BAD_REQUEST);
    }
    const { affected } = await this.imageRepository.softDelete(id);
    if (affected) {
      return '删除成功';
    } else {
      return '删除失败';
    }
  }

  // 内部查询方法
  private queryImageBuilder(): SelectQueryBuilder<ImageEntity> {
    const queryBuilder = this.imageRepository
      .createQueryBuilder('image')
      .leftJoin(UserEntity, 'user', 'image.userId = user.id')
      .leftJoin(ResourceEntity, 'resource', 'image.resourceId = resource.id');

    // 使用数组方式选择字段，避免类型推断问题
    queryBuilder.select([
      'image.id',
      'image.name',
      'image.size',
      'image.resourceId',
      'resource.path as resourcePath',
      'image.description',
      'image.userId',
      'image.createdTime',
      'image.updatedTime',
      'image.deletedTime',
      'user.username',
    ]);

    return queryBuilder.orderBy('image.createdTime', 'DESC');
  }
}
