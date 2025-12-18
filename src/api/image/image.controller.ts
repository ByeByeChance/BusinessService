import { ImageService } from './image.service';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QueryImageDto } from './image-core/dto/image.query';
import { ResultListVo } from '@src/shared/vo/result.vo';
import { ImageVo } from './image-core/vo/image.vo';
import { ImageDto } from './image-core/dto/image.dto';
import { CurrentUser } from '@src/decorators';
import { ICurrentUserType } from '@src/decorators';
import { QueryDebugRecordDto } from './image-debug/dto/debugRecord.query';
import { DebugRecordDto } from './image-debug/dto/debugRecord.dto';
import { DebugRecordVo } from './image-debug/vo/debugRecord.vo';

@ApiTags('镜像模块')
@Controller('imageController')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get('getImageList')
  async getImageListApi(@Query() queryOption: QueryImageDto): Promise<ResultListVo<ImageVo>> {
    return await this.imageService.getImageList(queryOption);
  }

  @Post('createImage')
  async createImageApi(
    @Body() req: ImageDto,
    @CurrentUser() user: ICurrentUserType
  ): Promise<string> {
    return await this.imageService.createImage(req, user);
  }

  @Post('deleteImageById')
  async deleteImageByIdApi(@Body() req: { id: string }): Promise<string> {
    return await this.imageService.deleteImageById(req.id);
  }

  @Get('getDebugRecordList')
  async getDebugRecordListApi(
    @Query() queryOption: QueryDebugRecordDto
  ): Promise<ResultListVo<DebugRecordVo>> {
    return await this.imageService.getDebugRecordList(queryOption);
  }

  @Post('startDebug')
  async startDebugApi(
    @Body() req: DebugRecordDto,
    @CurrentUser() user: ICurrentUserType
  ): Promise<string> {
    return await this.imageService.startDebug(req, user);
  }
}
