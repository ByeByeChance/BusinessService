import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MergeService } from './merge.service';

@Controller()
export class MergeController {
  constructor(private readonly mergeService: MergeService) {}

  @MessagePattern('merge-chunks')
  async mergeChunks(data: any) {
    try {
      const result = await this.mergeService.mergeChunks(
        data.resourceId,
        data.chunkDir,
        data.mergedFilePath,
        data.filename,
        data.originalFilename,
        data.size,
        data.mimeType,
        data.md5,
        data.chunkTotal,
        data.chunkUploaded,
      );
      return result;
    } catch (error) {
      throw error;
    }
  }
}
