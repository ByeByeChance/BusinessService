import { Injectable } from '@nestjs/common';
import { ImageCoreService } from './image-core/image-core.service';
import { ImageDto } from './image-core/dto/image.dto';
import { QueryImageDto } from './image-core/dto/image.query';
import { ImageVo } from './image-core/vo/image.vo';
import { ResultListVo } from '@src/shared/vo/result.vo';
import { ICurrentUserType } from '@src/decorators';
import { ImageDebugService } from './image-debug/image-debug.service';
import { QueryDebugRecordDto } from './image-debug/dto/debugRecord.query';
import { DebugRecordVo } from './image-debug/vo/debugRecord.vo';
import { DebugRecordDto } from './image-debug/dto/debugRecord.dto';

@Injectable()
export class ImageService {
  constructor(
    private readonly imageCoreService: ImageCoreService,
    private readonly imageDebugService: ImageDebugService
  ) {}

  /**
   * @Description: 创建镜像
   * @param {ImageDto} imageDto
   * @return {*}
   */
  async createImage(imageDto: ImageDto, user: ICurrentUserType): Promise<string> {
    return this.imageCoreService.createImage(imageDto, user);
  }

  /**
   * @Description: 获取镜像列表
   * @param {QueryImageDto} queryOption
   * @return {*}
   */
  async getImageList(queryOption: QueryImageDto): Promise<ResultListVo<ImageVo>> {
    return this.imageCoreService.getImageList(queryOption);
  }

  /**
   * @Description: 删除镜像
   * @param {id} id
   * @return {*}
   */
  async deleteImageById(id: string): Promise<string> {
    return this.imageCoreService.deleteImageById(id);
  }

  /**
   * @Description: 获取调试记录列表
   * @param {QueryDebugRecordDto} queryOption
   * @return {*}
   */
  async getDebugRecordList(queryOption: QueryDebugRecordDto): Promise<ResultListVo<DebugRecordVo>> {
    return this.imageDebugService.getDebugRecordList(queryOption);
  }

  async startDebug(debugRecordDto: DebugRecordDto, user: ICurrentUserType): Promise<string> {
    return this.imageDebugService.startDebug(debugRecordDto, user);
  }
}
