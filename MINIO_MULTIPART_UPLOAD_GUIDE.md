# MinIO 分片上传与文件合并指南

## 1. 概述

MinIO 支持 S3 兼容的分片上传 API，用于处理大文件上传。通过分片上传，可以将大文件分成多个小块（分片）进行上传，最后再合并成完整文件。

## 2. 核心概念

- **分片上传会话**：每个大文件上传都会创建一个会话，由 `uploadId` 标识
- **分片（Part）**：文件被分割成的小块，每个分片有唯一的 `partNumber` 和 `ETag`
- **合并（Complete）**：所有分片上传完成后，调用合并 API 将它们组合成完整文件
- **中止（Abort）**：如果上传失败，可以中止会话以清理资源

## 3. 官方 SDK API

MinIO 官方 JavaScript SDK 提供了以下分片上传相关方法：

### 3.1 初始化分片上传
```typescript
initiateNewMultipartUpload(bucketName: string, objectName: string, headers: RequestHeaders): Promise<string>
```
- 返回 `uploadId`，用于后续操作

### 3.2 上传分片
```typescript
putObject(bucketName: string, objectName: string, stream: Stream | Buffer | string, size: number, headers: RequestHeaders): Promise<UploadedObjectInfo>
```
- 上传单个分片时，需要在 headers 中指定 `UploadId` 和 `PartNumber`

### 3.3 完成分片上传
```typescript
completeMultipartUpload(bucketName: string, objectName: string, uploadId: string, parts: { ETag: string; PartNumber: number }[]): Promise<any>
```
- `parts` 参数包含所有已上传分片的信息

### 3.4 中止分片上传
```typescript
abortMultipartUpload(bucketName: string, objectName: string, uploadId: string): Promise<void>
```

## 4. 在项目中使用

### 4.1 项目中的 MinIO 客户端

项目使用 `nestjs-minio-client` 包，该包是对官方 SDK 的封装。可以通过 `client` 属性访问官方 SDK 的所有方法：

```typescript
import { MinioClientService } from '@src/minioClient/minioClient.service';

// 在服务中注入
constructor(private readonly minioClientService: MinioClientService) {}

// 获取官方 SDK 客户端
const minioClient = this.minioClientService.client;
```

### 4.2 自动分片上传

官方 SDK 的 `putObject` 方法会自动处理大文件的分片上传和合并：

```typescript
async uploadLargeFile(file: Express.Multer.File, bucketName: string, objectName: string) {
  try {
    // SDK 会自动处理分片上传
    const result = await this.minioClientService.client.putObject(
      bucketName,
      objectName,
      file.stream,
      file.size,
      {
        'Content-Type': file.mimetype
      }
    );
    return result;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}
```

### 4.3 手动分片上传

如果需要更精细的控制，可以手动实现分片上传：

```typescript
async manualMultipartUpload(filePath: string, bucketName: string, objectName: string) {
  try {
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB 分片大小
    const fileStats = fs.statSync(filePath);
    const fileSize = fileStats.size;
    const totalParts = Math.ceil(fileSize / CHUNK_SIZE);
    
    // 1. 初始化分片上传
    const uploadId = await this.minioClientService.client.initiateNewMultipartUpload(
      bucketName,
      objectName,
      { 'Content-Type': 'application/octet-stream' }
    );
    
    // 2. 上传分片
    const parts = [];
    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      const start = (partNumber - 1) * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, fileSize);
      const partSize = end - start;
      
      // 读取分片数据
      const partData = fs.readFileSync(filePath, { start, end });
      
      // 上传分片
      const result = await this.minioClientService.client.putObject(
        bucketName,
        objectName,
        partData,
        partSize,
        {
          'UploadId': uploadId,
          'PartNumber': partNumber
        }
      );
      
      parts.push({
        ETag: result.etag,
        PartNumber: partNumber
      });
    }
    
    // 3. 完成分片上传
    const completeResult = await (this.minioClientService.client as any).completeMultipartUpload(
      bucketName,
      objectName,
      uploadId,
      parts
    );
    
    return completeResult;
    
  } catch (error) {
    console.error('Error in multipart upload:', error);
    throw error;
  }
}
```

## 5. 项目中扩展 MinIO 客户端

当前项目的 `minioClient.service.ts` 只实现了基本功能，可以扩展它以支持分片上传和合并：

```typescript
// src/minioClient/minioClient.service.ts

import { Injectable } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';

@Injectable()
export class MinioClientService {
  constructor(private readonly minioService: MinioService) {}

  get client() {
    return this.minioService.client;
  }

  // 现有方法...

  /**
   * 初始化分片上传
   */
  async initiateMultipartUpload(bucketName: string, objectName: string, headers?: any) {
    return this.client.initiateNewMultipartUpload(bucketName, objectName, headers || {});
  }

  /**
   * 上传分片
   */
  async uploadPart(
    bucketName: string,
    objectName: string,
    uploadId: string,
    partNumber: number,
    data: Buffer | NodeJS.ReadableStream,
    size: number,
    headers?: any
  ) {
    return this.client.putObject(
      bucketName,
      objectName,
      data,
      size,
      {
        'UploadId': uploadId,
        'PartNumber': partNumber,
        ...headers
      }
    );
  }

  /**
   * 完成分片上传
   */
  async completeMultipartUpload(
    bucketName: string,
    objectName: string,
    uploadId: string,
    parts: { ETag: string; PartNumber: number }[]
  ) {
    // @ts-ignore - completeMultipartUpload 方法存在但类型定义可能缺失
    return this.client.completeMultipartUpload(bucketName, objectName, uploadId, parts);
  }

  /**
   * 中止分片上传
   */
  async abortMultipartUpload(bucketName: string, objectName: string, uploadId: string) {
    return this.client.abortMultipartUpload(bucketName, objectName, uploadId);
  }
}
```

## 6. 注意事项

1. **分片大小**：最小分片大小为 5MB（最后一个分片除外）
2. **分片数量**：最多支持 10,000 个分片
3. **并发上传**：分片可以并行上传，提高上传速度
4. **错误处理**：上传失败时需要清理资源，调用 `abortMultipartUpload`
5. **ETag**：每个分片上传后会返回 ETag，合并时需要提供

## 7. 参考资料

- [MinIO 官方文档](https://min.io/docs/minio/linux/developers/javascript/API.html)
- [S3 分片上传文档](https://docs.aws.amazon.com/AmazonS3/latest/userguide/uploadobjusingmpu.html)
- [nestjs-minio-client GitHub](https://github.com/Lambda-School-Labs/nestjs-minio-client)

## 8. 常见问题

### Q: 为什么在 MinIO 官网上找不到文件合并的方法？
A: MinIO 使用 S3 兼容的 API，文件合并功能通过 `completeMultipartUpload` 方法实现，该方法在官方 SDK 中存在。

### Q: nestjs-minio-client 支持分片上传吗？
A: 是的，nestjs-minio-client 是对官方 SDK 的封装，可以通过 `client` 属性访问所有官方 SDK 方法。

### Q: 如何设置分片大小？
A: 可以在创建 MinIO 客户端时设置 `partSize` 参数，或在上传时手动指定分片大小。

### Q: 分片上传失败后如何处理？
A: 调用 `abortMultipartUpload` 方法清理资源，然后重新开始上传。