import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser, RedisLimitApi } from '@src/decorators';
import { ICurrentUserType } from '@src/decorators';
import { ResourceService } from './resource.service';
import { ResourceDto, MergeChunksDto } from './dto/resource.dto';
import { QueryResourceDto } from './dto/resource.query';
import {
  ResourceUploadInitVo,
  ChunkUploadVo,
  MergeChunksVo,
  ResourceVo,
  UploadFileVo,
} from './vo/resource.vo';
import { ResultDataVo, ResultListVo } from '@src/shared/vo/result.vo';
import { AuthGuard } from '@src/guard/auth.guard';
import { PermissionGuard } from '@src/guard/permission.guard';
import { RequirePermissions } from '@src/decorators/permission.decorator';

@ApiTags('资源管理模块')
@Controller('resourceController')
@UseGuards(AuthGuard, PermissionGuard)
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @ApiOperation({ summary: '初始化文件上传' })
  @Post('initUpload')
  @RedisLimitApi({ exSecond: 10, maxRequest: 100 })
  async initUpload(
    @Body() resourceDto: ResourceDto,
    @CurrentUser() user: ICurrentUserType
  ): Promise<ResultDataVo<ResourceUploadInitVo>> {
    const data = await this.resourceService.initUpload(resourceDto, user.id);
    return {
      code: 200,
      msg: '初始化上传成功',
      data,
    };
  }

  @ApiOperation({ summary: '普通文件上传' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        resourceId: {
          type: 'string',
          description: '资源ID',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: '文件数据',
        },
      },
    },
  })
  @Post('uploadFile')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Body('resourceId') resourceId: string,
    @UploadedFile() file: Express.Multer.File
  ): Promise<ResultDataVo<UploadFileVo>> {
    const data = await this.resourceService.uploadFile(resourceId, file);
    return {
      code: 200,
      msg: '文件上传成功',
      data,
    };
  }

  @ApiOperation({ summary: '分片上传' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        resourceId: {
          type: 'string',
          description: '资源ID',
        },
        chunkIndex: {
          type: 'number',
          description: '分片索引',
        },
        chunkSize: {
          type: 'number',
          description: '分片大小',
        },
        chunkFile: {
          type: 'string',
          format: 'binary',
          description: '分片数据',
        },
      },
    },
  })
  @Post('uploadChunk')
  @UseInterceptors(FileInterceptor('chunkFile'))
  @RedisLimitApi({ exSecond: 10, maxRequest: 100 })
  async uploadChunk(
    @Body()
    {
      resourceId,
      chunkIndex,
      chunkSize,
    }: { resourceId: string; chunkIndex: number; chunkSize: number },
    @UploadedFile() chunkFile: Express.Multer.File
  ): Promise<ResultDataVo<ChunkUploadVo>> {
    const data = await this.resourceService.uploadChunk({
      resourceId,
      chunkIndex,
      chunkFile,
      chunkSize,
    });
    return {
      code: 200,
      msg: '分片上传成功',
      data,
    };
  }

  @ApiOperation({ summary: '合并分片' })
  @Post('mergeChunks')
  @RedisLimitApi({ exSecond: 30, maxRequest: 50 })
  async mergeChunks(@Body() mergeChunksDto: MergeChunksDto): Promise<ResultDataVo<MergeChunksVo>> {
    const data = await this.resourceService.mergeChunks(mergeChunksDto.resourceId);
    return {
      code: 200,
      msg: '分片合并成功',
      data,
    };
  }

  @ApiOperation({ summary: '获取资源列表' })
  @Get('getResourceList')
  async getResourceList(
    @Query() queryResourceDto: QueryResourceDto
  ): Promise<ResultDataVo<ResultListVo<ResourceVo>>> {
    const data = await this.resourceService.getResourceList(queryResourceDto);
    return {
      code: 200,
      msg: '获取资源列表成功',
      data,
    };
  }

  @ApiOperation({ summary: '获取资源详情' })
  @Get('getResourceDetailById')
  async getResourceDetailById(@Query('id') id: string): Promise<ResultDataVo<ResourceVo>> {
    const data = await this.resourceService.getResourceDetail(id);
    return {
      code: 200,
      msg: '获取资源详情成功',
      data,
    };
  }

  @ApiOperation({ summary: '删除资源' })
  @RequirePermissions('resource:delete')
  @Post('deleteResource')
  async deleteResource(@Body() req: { id: string }): Promise<ResultDataVo> {
    await this.resourceService.deleteResource(req.id);
    return {
      code: 200,
      msg: '删除资源成功',
      data: null,
    };
  }
}
