import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOperator,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import {
  ResourceEntity,
  ResourceStatus,
  ResourceStatusEnum,
  ResourceType,
  ResourceTypeEnum,
} from './entities/resource.entity';
import { ResourceDto, ChunkUploadDto } from './dto/resource.dto';
import { QueryResourceDto } from './dto/resource.query';
import { MinioClientService } from '@src/minioClient/minioClient.service';
import { RedisService } from '@src/plugin/redis/redis.service';
import { ClientProxy } from '@nestjs/microservices';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PageEnum } from '@src/enums/page.enum';
import { UserEntity } from '../user/entities/user.entity';
import { ResourceVo } from './vo/resource.vo';

@Injectable()
export class ResourceService {
  // 配置常量
  private readonly MAX_SINGLE_UPLOAD_SIZE: number;
  private readonly CHUNK_SIZE: number;
  private readonly TEMP_DIR: string;

  constructor(
    @InjectRepository(ResourceEntity)
    private readonly resourceRepository: Repository<ResourceEntity>,
    private readonly configService: ConfigService,
    private readonly minioClientService: MinioClientService,
    private readonly redisService: RedisService,
    @Inject('DECOMPRESS_SERVICE')
    private readonly decompressClient: ClientProxy,
    @Inject('MERGE_SERVICE')
    private readonly mergeClient: ClientProxy
  ) {
    // 从配置文件获取，默认值
    this.MAX_SINGLE_UPLOAD_SIZE = this.configService.get<number>(
      'UPLOAD.MAX_SINGLE_SIZE',
      1 * 1024 * 1024
    ); // 默认1MB，临时修改用于测试分块上传
    this.CHUNK_SIZE = this.configService.get<number>('UPLOAD.CHUNK_SIZE', 5 * 1024 * 1024); // 默认5MB，临时修改用于测试分块上传
    this.TEMP_DIR = this.configService.get<string>('UPLOAD.TEMP_DIR', '/tmp');

    // 确保临时目录存在
    if (!fs.existsSync(this.TEMP_DIR)) {
      fs.mkdirSync(this.TEMP_DIR, { recursive: true });
    }

    // 启动临时文件定期清理任务
    this.startTempFileCleanupTask();
  }

  /**
   * 启动临时文件定期清理任务
   */
  private startTempFileCleanupTask() {
    // 每小时执行一次清理
    const cleanupInterval = 60 * 60 * 1000;

    // 立即执行一次清理
    this.cleanupTempFiles();

    // 设置定时任务
    setInterval(() => {
      this.cleanupTempFiles().catch((error) => {
        console.error('临时文件清理任务执行失败:', error);
      });
    }, cleanupInterval);
  }

  /**
   * 清理临时文件
   */
  private async cleanupTempFiles() {
    try {
      // 过期时间：2小时前的文件
      const EXPIRE_TIME = 2 * 60 * 60 * 1000;
      const now = Date.now();

      // 读取临时目录
      const files = await fs.promises.readdir(this.TEMP_DIR);

      for (const file of files) {
        const filePath = path.join(this.TEMP_DIR, file);
        const stats = await fs.promises.stat(filePath);

        // 清理超过过期时间的分片目录
        if (stats.isDirectory() && file.startsWith('resource_chunks_')) {
          if (now - stats.mtimeMs > EXPIRE_TIME) {
            console.log(`清理过期分片目录: ${filePath}`);
            await fs.promises.rm(filePath, { recursive: true, force: true });
          }
        }
        // 清理超过过期时间的合并文件
        else if (stats.isFile() && file.startsWith('merged_')) {
          if (now - stats.mtimeMs > EXPIRE_TIME) {
            console.log(`清理过期合并文件: ${filePath}`);
            await fs.promises.unlink(filePath);
          }
        }
      }

      console.log('临时文件清理完成');
    } catch (error) {
      console.error('临时文件清理失败:', error);
    }
  }

  /**
   * 根据资源类型获取存储路径
   */
  private getStoragePath(): string {
    // 所有文件统一上传至originalFile目录
    return 'originalFile/';
  }

  /**
   * 根据资源类型获取解压缩后的存储路径
   */
  private getDecompressPath(type: ResourceType, resourceId?: string): string {
    const storagePaths = this.configService.get<Record<string, string>>(
      'MINIO_CONFIG.STORAGE_PATHS',
      {}
    );

    switch (type) {
      case ResourceTypeEnum.SAMPLE_GROUP:
        // 使用resourceId作为唯一标识，确保每个样本组都有独立的文件夹
        const uniqueId = resourceId || uuidv4();
        return `${storagePaths.SAMPLE_GROUP || 'sample_group/'}${uniqueId}/`;
      case ResourceTypeEnum.IMAGE:
        return storagePaths.IMAGE || 'image/';
      case ResourceTypeEnum.ALGORITHM_PACKAGE:
        return storagePaths.ALGORITHM || 'algorithm/';
      case ResourceTypeEnum.MODEL:
        return storagePaths.MODEL || 'model/';
      case ResourceTypeEnum.PICTURE:
        return storagePaths.PICTURE || 'picture/';
      default:
        return storagePaths.OTHER || 'other/';
    }
  }

  /**
   * 生成存储地址
   */
  private generateStorageUrl(bucketName: string, path: string): string {
    const endpoint = this.configService.get('MINIO_CONFIG.MINIO_ENDPOINT');
    const port = this.configService.get('MINIO_CONFIG.MINIO_PORT');
    // 确保endpoint包含http://前缀
    const fullEndpoint = endpoint.startsWith('http') ? endpoint : `http://${endpoint}`;
    // 生成包含minio路径的完整URL
    return `${fullEndpoint}:${port}/minio/${bucketName}/${path}`;
  }

  /**
   * 初始化文件上传
   */
  async initUpload(resourceDto: ResourceDto, userId: string) {
    // 生成文件名
    const ext = path.extname(resourceDto.originalFilename);
    const hashedFileName = crypto
      .createHash('md5')
      .update(`${resourceDto.originalFilename}_${Date.now()}_${uuidv4()}`)
      .digest('hex');

    // 获取存储路径
    const storagePath = this.getStoragePath();
    const filename = `${storagePath}${hashedFileName}${ext}`;

    // 判断是否需要分片上传
    const needChunkUpload = resourceDto.size > this.MAX_SINGLE_UPLOAD_SIZE;
    const chunkSize = needChunkUpload ? this.CHUNK_SIZE : undefined;
    const chunkTotal = needChunkUpload ? Math.ceil(resourceDto.size / this.CHUNK_SIZE) : undefined;

    // 创建资源记录
    const resource = this.resourceRepository.create({
      ...resourceDto,
      filename,
      status: needChunkUpload ? ResourceStatusEnum.CHUNK_UPLOADING : undefined, // 大文件设置CHUNK_UPLOADING，小文件使用默认值INIT
      chunkSize,
      chunkTotal,
      chunkUploaded: needChunkUpload ? [] : undefined,
      userId,
    });

    await this.resourceRepository.save(resource);

    return {
      resourceId: resource.id,
      needChunkUpload,
      chunkSize,
      chunkTotal,
    };
  }

  /**
   * 普通文件上传
   */
  async uploadFile(resourceId: string, file: Express.Multer.File) {
    // 获取资源记录
    const resource = await this.resourceRepository.findOne({
      where: { id: resourceId, deletedTime: undefined },
    });

    if (!resource) {
      throw new HttpException('资源不存在，请先初始化上传', HttpStatus.NOT_FOUND);
    }

    if (
      resource.status !== ResourceStatusEnum.INIT &&
      resource.status !== ResourceStatusEnum.CHUNK_UPLOADING
    ) {
      throw new HttpException('资源状态错误，无法上传', HttpStatus.BAD_REQUEST);
    }

    // 验证文件大小
    if (file.size !== Number(resource.size)) {
      throw new HttpException('文件大小不匹配', HttpStatus.BAD_REQUEST);
    }

    try {
      // 更新资源状态
      await this.resourceRepository.update(resourceId, {
        status: ResourceStatusEnum.UPLOADING,
        mimeType: file.mimetype,
      });

      let resourceStatus: ResourceStatus = ResourceStatusEnum.FAILED;

      try {
        // 上传到minio，使用配置文件中的bucket名称
        const bucketName = this.configService.get('MINIO_CONFIG.MINIO_BUCKET');
        await this.minioClientService.upload(file, bucketName, resource.filename);

        // 生成存储地址
        const filePath = this.generateStorageUrl(bucketName, resource.filename);

        // 对于picture和other类型，path与filePath相同
        if (
          resource.type === ResourceTypeEnum.PICTURE ||
          resource.type === ResourceTypeEnum.OTHER
        ) {
          // 更新资源记录
          await this.resourceRepository.update(resourceId, {
            filePath,
            path: filePath, // path与filePath相同
            status: ResourceStatusEnum.STORED,
          });
          resourceStatus = ResourceStatusEnum.STORED;
        }
        // 对于需要解压缩的类型
        else if (this.needDecompress(resource.type)) {
          // 更新资源记录，保存filePath和path（初始值与filePath相同，解压缩后会更新）
          await this.resourceRepository.update(resourceId, {
            filePath,
            path: filePath, // 初始path与filePath相同，解压缩后会更新为解压缩目录
            status: ResourceStatusEnum.UPLOADED,
          });

          // 创建临时文件用于解压缩
          const tempFileName = `temp_${path.basename(resource.filename)}`;
          const tempFilePath = path.join(this.TEMP_DIR, tempFileName);

          try {
            // 将文件保存到临时目录
            await fs.promises.writeFile(tempFilePath, new Uint8Array(file.buffer));

            // 调用解压缩服务
            await this.decompressFile(tempFilePath, resource);
            resourceStatus = ResourceStatusEnum.STORED;
          } catch (decompressError) {
            console.error('解压缩失败:', (decompressError as Error).message);
            resourceStatus = ResourceStatusEnum.FAILED;
            await this.resourceRepository.update(resourceId, {
              failedReason: `解压缩失败: ${(decompressError as Error).message}`,
              status: ResourceStatusEnum.FAILED,
            });
          } finally {
            // 删除临时文件
            try {
              await fs.promises.unlink(tempFilePath);
            } catch (deleteError) {
              console.error('删除临时文件失败:', (deleteError as Error).message);
            }
          }
        }
      } catch (error) {
        // 如果minio上传失败，仍然将资源状态设置为stored，但不更新存储信息
        console.warn('Minio上传失败，跳过存储信息更新:', error);
        resourceStatus = ResourceStatusEnum.FAILED;
        await this.resourceRepository.update(resourceId, {
          failedReason: `Minio上传失败: ${(error as Error).message}`,
        });
      }

      // 更新资源状态
      await this.resourceRepository.update(resourceId, {
        status: resourceStatus,
      });

      return {
        resourceId,
        storageKey: resource.filename,
      };
    } catch (error) {
      // 上传失败，更新资源状态
      await this.resourceRepository.update(resourceId, {
        status: ResourceStatusEnum.FAILED,
        failedReason: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * 分片上传
   */
  async uploadChunk(chunkUploadDto: ChunkUploadDto) {
    const { resourceId, chunkIndex, chunkFile } = chunkUploadDto;
    // 并发控制参数
    const CONCURRENT_LIMIT = 5; // 同一资源的并发上传限制
    const LOCK_EXPIRY = 30; // 锁过期时间（秒）

    // 获取资源记录
    const resource = await this.resourceRepository.findOne({
      where: { id: resourceId, deletedTime: undefined },
    });

    if (!resource) {
      throw new HttpException('资源不存在，请先初始化上传', HttpStatus.NOT_FOUND);
    }

    if (resource.status !== ResourceStatusEnum.CHUNK_UPLOADING) {
      throw new HttpException('资源状态错误，无法分片上传', HttpStatus.BAD_REQUEST);
    }

    if (!resource.chunkTotal || !resource.chunkSize) {
      throw new HttpException('资源分片配置错误', HttpStatus.BAD_REQUEST);
    }

    // 确保chunkIndex和resource.chunkTotal都是数字类型
    const chunkIndexNum = Number(chunkIndex);
    const chunkTotalNum = Number(resource.chunkTotal);
    const chunkSizeNum = Number(resource.chunkSize);

    if (chunkIndexNum >= chunkTotalNum) {
      throw new HttpException('分片索引超出范围', HttpStatus.BAD_REQUEST);
    }

    // 验证分片大小
    // 最后一个分片的大小应该小于或等于chunkSize，其他分片的大小应该等于chunkSize
    const isLastChunk = chunkIndexNum === chunkTotalNum - 1;
    if (!isLastChunk && chunkFile.size !== chunkSizeNum) {
      throw new HttpException(`分片大小错误，应为${chunkSizeNum}字节`, HttpStatus.BAD_REQUEST);
    }
    if (isLastChunk && chunkFile.size > chunkSizeNum) {
      throw new HttpException(
        `最后一个分片大小不能超过${chunkSizeNum}字节`,
        HttpStatus.BAD_REQUEST
      );
    }

    // 并发控制 - 使用Redis实现
    const lockKey = `resource_upload_lock:${resourceId}`;

    try {
      // 使用Redis Lua脚本实现原子操作，避免并发问题
      const acquireLockScript = `
        local currentCount = redis.call('GET', KEYS[1])
        if currentCount then
          if tonumber(currentCount) >= tonumber(ARGV[1]) then
            return {tonumber(currentCount), false}
          end
          redis.call('INCR', KEYS[1])
          return {tonumber(currentCount) + 1, true}
        else
          redis.call('SET', KEYS[1], 1, 'EX', ARGV[2])
          return {1, true}
        end
      `;

      const result = await this.redisService.eval(
        acquireLockScript,
        1,
        lockKey,
        CONCURRENT_LIMIT.toString(),
        LOCK_EXPIRY.toString()
      );

      const [count, acquired] = result;

      if (!acquired) {
        throw new HttpException(
          `当前分片上传并发数已达上限（${count}/${CONCURRENT_LIMIT}），请稍后重试`,
          HttpStatus.TOO_MANY_REQUESTS
        );
      }

      // 确保分片临时目录存在
      const chunkDir = path.join(this.TEMP_DIR, `resource_chunks_${resourceId}`);
      if (!fs.existsSync(chunkDir)) {
        fs.mkdirSync(chunkDir, { recursive: true });
      }

      // 保存分片 - fs.promises.writeFile默认会覆盖已存在的文件，天然支持重复上传覆盖
      const chunkPath = path.join(chunkDir, `chunk_${chunkIndex}`);
      await fs.promises.writeFile(chunkPath, new Uint8Array(chunkFile.buffer));

      // 更新已上传分片列表 - 去重处理确保重复上传的分片只记录一次
      const chunkUploaded = [...(resource.chunkUploaded || []), chunkIndex];
      // 去重并排序，保证分片列表的唯一性和有序性
      const uniqueChunkUploaded = Array.from(new Set(chunkUploaded)).sort((a, b) => a - b);

      // 更新资源记录
      await this.resourceRepository.update(resourceId, {
        chunkUploaded: uniqueChunkUploaded,
      });

      // 检查是否所有分片都已上传完成
      const allUploaded = uniqueChunkUploaded.length === resource.chunkTotal;

      return {
        resourceId,
        chunkIndex,
        uploaded: true,
        uploadedChunks: uniqueChunkUploaded.length,
        totalChunks: resource.chunkTotal,
        allUploaded,
      };
    } catch (error) {
      throw new HttpException(
        `分片上传失败: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    } finally {
      // 使用Redis Lua脚本实现原子操作，避免并发问题
      const releaseLockScript = `
        local currentCount = redis.call('GET', KEYS[1])
        if currentCount then
          local newCount = redis.call('DECR', KEYS[1])
          if newCount <= 0 then
            redis.call('DEL', KEYS[1])
            return 0
          end
          return newCount
        else
          return -1
        end
      `;

      await this.redisService.eval(releaseLockScript, 1, lockKey);
    }
  }

  /**
   * 合并分片
   */
  async mergeChunks(resourceId: string) {
    // 获取资源记录
    const resource = await this.resourceRepository.findOne({
      where: { id: resourceId, deletedTime: undefined },
    });

    if (!resource) {
      throw new HttpException('资源不存在，请先初始化上传', HttpStatus.NOT_FOUND);
    }

    if (resource.status !== ResourceStatusEnum.CHUNK_UPLOADING) {
      throw new HttpException('资源状态错误，无法合并分片', HttpStatus.BAD_REQUEST);
    }

    if (!resource.chunkTotal || !resource.chunkSize || !resource.chunkUploaded) {
      throw new HttpException('资源分片配置错误', HttpStatus.BAD_REQUEST);
    }

    // 检查是否所有分片都已上传
    if (
      !resource.chunkUploaded ||
      !resource.chunkTotal ||
      resource.chunkUploaded.length !== resource.chunkTotal
    ) {
      throw new HttpException('分片未完全上传或配置错误', HttpStatus.BAD_REQUEST);
    }

    try {
      // 更新资源状态为合并中
      await this.resourceRepository.update(resourceId, {
        status: ResourceStatusEnum.MERGING,
      });

      // 合并分片 - 调用微服务
      const chunkDir = path.join(this.TEMP_DIR, `resource_chunks_${resourceId}`);
      const mergedFilePath = path.join(this.TEMP_DIR, `merged_${resource.filename}`);

      // 调用合并微服务
      const mergeResult = await lastValueFrom(
        this.mergeClient.send<any>('merge-chunks', {
          resourceId,
          chunkDir,
          mergedFilePath,
          filename: resource.filename,
          originalFilename: resource.originalFilename,
          size: resource.size,
          mimeType: resource.mimeType,
          md5: resource.md5,
          chunkTotal: resource.chunkTotal,
          chunkUploaded: resource.chunkUploaded,
        })
      );

      // 更新资源状态为已合并
      await this.resourceRepository.update(resourceId, {
        status: ResourceStatusEnum.MERGED,
        md5: mergeResult.fileMd5,
      });

      // 上传合并后的文件到MinIO
      const bucketName = this.configService.get('MINIO_CONFIG.MINIO_BUCKET', 'resource');

      // 直接调用putObject方法，传递文件流到MinIO
      await this.minioClientService['putObject'](
        bucketName,
        resource.filename,
        fs.createReadStream(mergedFilePath)
      );

      // 生成存储地址
      const filePath = this.generateStorageUrl(bucketName, resource.filename);

      // 对于picture和other类型，path与filePath相同
      if (resource.type === ResourceTypeEnum.PICTURE || resource.type === ResourceTypeEnum.OTHER) {
        // 更新资源记录
        await this.resourceRepository.update(resourceId, {
          filePath,
          path: filePath, // path与filePath相同
          status: ResourceStatusEnum.STORED,
          mimeType: resource.mimeType,
        });
      }
      // 对于需要解压缩的类型
      else if (this.needDecompress(resource.type)) {
        // 更新资源记录，保存filePath和path（初始值与filePath相同，解压缩后会更新）
        await this.resourceRepository.update(resourceId, {
          filePath,
          path: filePath, // 初始path与filePath相同，解压缩后会更新为解压缩目录
          status: ResourceStatusEnum.UPLOADED,
          mimeType: resource.mimeType,
        });

        // 调用解压缩服务
        await this.decompressFile(mergedFilePath, resource);
      } else {
        // 其他不需要解压缩的类型
        await this.resourceRepository.update(resourceId, {
          filePath,
          path: filePath, // path与filePath相同
          status: ResourceStatusEnum.STORED,
          mimeType: resource.mimeType,
        });
      }

      // 清理临时文件
      await fs.promises.unlink(mergedFilePath);
      await fs.promises.rm(chunkDir, { recursive: true, force: true });

      return {
        resourceId,
        merged: true,
        filePath,
      };
    } catch (error) {
      // 更新资源状态为失败
      await this.resourceRepository.update(resourceId, {
        status: ResourceStatusEnum.FAILED,
        failedReason: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * 获取资源列表
   */
  async getResourceList(queryResourceDto: QueryResourceDto) {
    try {
      const {
        id,
        originalFilename,
        type,
        status,
        current = PageEnum.PAGE_NUMBER,
        pageSize = PageEnum.PAGE_SIZE,
        createdTimeStart,
        createdTimeEnd,
        updatedTimeStart,
        updatedTimeEnd,
      } = queryResourceDto;
      const query: Record<string, FindOperator<string> | string | number | Date> = {
        ...(id && { id }),
        ...(originalFilename && { originalFilename: ILike(`%${originalFilename}%`) }),
        ...(type && { type }),
        ...(status && { status }),
        ...(createdTimeStart && { createdTime: MoreThanOrEqual(createdTimeStart) }),
        ...(createdTimeEnd && { createdTime: LessThanOrEqual(createdTimeEnd) }),
        ...(updatedTimeStart && { updatedTime: MoreThanOrEqual(updatedTimeStart) }),
        ...(updatedTimeEnd && { updatedTime: LessThanOrEqual(updatedTimeEnd) }),
      };

      const total = await this.resourceRepository
        .createQueryBuilder('resource')
        .where([query])
        .getCount();
      const queryBuilder = this.queryResourceBuilder();
      const data: ResourceVo[] = await queryBuilder
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
        `资源列表获取失败: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 获取资源详情
   */
  async getResourceDetail(resourceId: string) {
    const resource = await this.resourceRepository.findOne({
      where: { id: resourceId, deletedTime: undefined },
    });

    if (!resource) {
      throw new HttpException('资源不存在', HttpStatus.NOT_FOUND);
    }

    return resource;
  }

  /**
   * 删除资源
   */
  async deleteResource(resourceId: string) {
    // 获取资源记录
    const resource = await this.resourceRepository.findOne({
      where: { id: resourceId, deletedTime: undefined },
    });

    if (!resource) {
      throw new HttpException('资源不存在', HttpStatus.NOT_FOUND);
    }

    // 如果资源已存储，从minio删除
    if (resource.filePath) {
      try {
        // 从filePath中解析出bucket和object key
        const urlParts = resource.filePath.split('/');
        const bucketName = urlParts[3]; // 假设格式为 http://endpoint:port/bucket/object
        const objectKey = urlParts.slice(4).join('/');
        await this.minioClientService.deleteFile(objectKey, bucketName);
      } catch (error) {
        // 记录错误但不影响资源删除
        console.error('删除minio文件失败:', (error as Error).message);
      }
    }

    // 软删除资源记录
    await this.resourceRepository.update(resourceId, {
      deletedTime: Date.now(),
    });

    return { success: true };
  }

  /**
   * 生成文件MD5
   */
  // private async generateFileMd5(filePath: string): Promise<string> {
  //   return new Promise((resolve, reject) => {
  //     const hash = crypto.createHash('md5');
  //     const stream = fs.createReadStream(filePath);

  //     stream.on('data', (data) => {
  //       hash.update(data as crypto.BinaryLike);
  //     });

  //     stream.on('end', () => {
  //       resolve(hash.digest('hex'));
  //     });

  //     stream.on('error', (error) => {
  //       reject(error);
  //     });
  //   });
  // }

  /**
   * 根据资源类型判断是否需要解压缩
   */
  private needDecompress(type: ResourceType): boolean {
    // sample_group、image、algorithm_package、model类型默认需要解压缩
    const decompressTypes: ResourceType[] = [
      ResourceTypeEnum.SAMPLE_GROUP,
      ResourceTypeEnum.IMAGE,
      ResourceTypeEnum.ALGORITHM_PACKAGE,
      ResourceTypeEnum.MODEL,
    ];
    return decompressTypes.includes(type);
  }

  /**
   * 调用解压缩微服务解压缩文件
   */
  private async decompressFile(filePath: string, resource: ResourceEntity): Promise<any> {
    // 确定解压缩目录
    const baseDecompressDir = this.configService.get<string>(
      'DECOMPRESS.BASE_DIR',
      '/tmp/decompressed'
    );
    const decompressDir = path.join(baseDecompressDir, resource.id);

    try {
      // 更新资源状态为解压缩中
      await this.resourceRepository.update(resource.id, {
        status: ResourceStatusEnum.DECOMPRESSING,
      });

      // 调用解压缩微服务
      const result = await lastValueFrom(
        this.decompressClient.send('decompress', {
          filePath,
          decompressDir,
          resourceId: resource.id,
          resourceType: resource.type,
          minioConfig: {
            endpoint: this.configService.get('MINIO_CONFIG.MINIO_ENDPOINT'),
            port: this.configService.get('MINIO_CONFIG.MINIO_PORT'),
            bucket: this.configService.get('MINIO_CONFIG.MINIO_BUCKET'),
            accessKey: this.configService.get('MINIO_CONFIG.MINIO_ACCESSKEY'),
            secretKey: this.configService.get('MINIO_CONFIG.MINIO_SECRETKEY'),
            storagePaths: this.configService.get('MINIO_CONFIG.STORAGE_PATHS'),
          },
        })
      );

      // 更新资源记录的解压缩路径和状态
      if (result?.success && result?.decompressedFiles) {
        // 生成解压缩后的访问地址
        const bucketName = this.configService.get('MINIO_CONFIG.MINIO_BUCKET');

        // 获取解压缩后的存储路径，传入resourceId作为唯一标识
        const decompressPath = this.getDecompressPath(resource.type, resource.id);
        const finalPath = this.generateStorageUrl(bucketName, decompressPath);

        await this.resourceRepository.update(resource.id, {
          path: finalPath, // 更新path为解压缩后的地址
          status: ResourceStatusEnum.STORED,
        });
      } else {
        // 解压缩失败，更新状态为FAILED
        await this.resourceRepository.update(resource.id, {
          status: ResourceStatusEnum.FAILED,
          failedReason: '解压缩失败',
        });
      }

      return result;
    } catch (error) {
      console.error('解压缩服务调用失败:', error);
      // 解压缩失败不影响主流程，返回null
      return null;
    }
  }

  // 内部查询方法
  private queryResourceBuilder(): SelectQueryBuilder<ResourceEntity> {
    const queryBuilder = this.resourceRepository.createQueryBuilder('resource');

    // 关联user表查询用户名
    queryBuilder.leftJoin(UserEntity, 'user', 'resource.userId = user.id');

    // 使用数组方式选择字段，避免类型推断问题
    queryBuilder.select([
      'resource.id',
      'resource.filename',
      'resource.originalFilename',
      'resource.path',
      'resource.size',
      'resource.type',
      'resource.status',
      'resource.userId',
      'resource.filePath',
      'resource.failedReason',
      'resource.createdTime',
      'resource.updatedTime',
      'resource.deletedTime',
      'user.username',
    ]);

    return queryBuilder.orderBy('resource.createdTime', 'DESC');
  }
}
